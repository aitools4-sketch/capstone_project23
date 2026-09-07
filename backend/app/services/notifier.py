"""Periodic re-scan worker (blueprint Phase 3). Re-checks every verified
monitored email (see monitored_emails.py — an account's own login email is
auto-verified on sign-up; additional ones need an explicit confirmation
click) against fresh breach data, and for anyone with a breach that wasn't
there last time, records a new scan snapshot, writes a notification row,
and emails an alert.

An account can monitor more than one email, so the unit of work here is
"one verified (user_id, email) pair," not "one user" — a single account
with three monitored emails gets checked, diffed, and (if warranted)
notified independently for each one.

DeHashed's own monitoring API would do this watching server-side without
us polling on a schedule, but that tier isn't active on this account (see
the corrected dehashed-monitoring-api project memory) — this cron-based
approach is the documented fallback, not a placeholder for something
better already available.
"""

import logging

from ..config import Settings
from ..db import get_service_client
from .breach_lookup import BreachLookupFailed, BreachLookupNotConfigured, lookup_breaches
from .email_sender import EmailNotConfigured, send_breach_alert_email
from .masking import mask_all
from .risk_scoring import get_risk_scorer

logger = logging.getLogger(__name__)


def _dedupe_latest_per_email(rows: list[dict]) -> dict[str, dict]:
    """rows must already be ordered most-recent-first. Returns each email's
    most recent scan, keyed by email — pulled out of _latest_scan_by_email
    so the dedup rule is testable without a live Supabase client, same
    reasoning as before this was keyed by user_id instead (see
    tests/test_notifier.py)."""
    latest: dict[str, dict] = {}
    for row in rows:
        if row["email"] not in latest:
            latest[row["email"]] = row
    return latest


def _email_alerts_enabled(client, user_id: str) -> bool:
    """No row is the common case (most users never visit the setting) and
    means unchanged from the default — enabled, same as before this
    preference existed. Mirrors routers/notification_preferences.py's GET
    handler; kept separate since one is Supabase-backed request code and
    the other is this module's plain service-role read."""
    rows = (
        client.table("notification_preferences")
        .select("email_alerts_enabled")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
        .data
    )
    return rows[0]["email_alerts_enabled"] if rows else True


def _latest_scan_by_email(client) -> dict[str, dict]:
    """Every email's most recent scan, keyed by email. supabase-py has no
    "distinct on" through the REST client, so this dedupes client-side —
    fine at this project's scale (one bulk query, not one per monitored
    email)."""
    rows = (
        client.table("scans")
        .select("*")
        .not_.is_("user_id", "null")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return _dedupe_latest_per_email(rows)


def _verified_monitored_emails(client) -> list[dict]:
    return (
        client.table("monitored_emails")
        .select("user_id, email")
        .not_.is_("verified_at", "null")
        .execute()
        .data
    )


def check_for_new_breaches(settings: Settings) -> int:
    """Runs one full pass over every verified monitored email. Returns how
    many got a new notification, for logging visibility into each
    scheduled run."""
    client = get_service_client()
    notified = 0

    latest_by_email = _latest_scan_by_email(client)

    for monitored in _verified_monitored_emails(client):
        user_id, email = monitored["user_id"], monitored["email"]
        known_scan = latest_by_email.get(email)
        # No prior scan (a freshly verified email the notifier hasn't
        # gotten to yet) means nothing is "known" — every breach found on
        # this first pass is correctly treated as new, not skipped.
        # A handful of pre-Phase-1 rows predate the current BreachRecord
        # shape entirely (client-submitted mock data from before breach
        # detection moved server-side) — skip anything that doesn't look
        # like a real breach entry rather than letting one bad row crash
        # the whole run.
        known_names = (
            {b["breach_name"] for b in known_scan["breaches"] if "breach_name" in b} if known_scan else set()
        )

        try:
            fresh_breaches = lookup_breaches(email, settings)
        except (BreachLookupNotConfigured, BreachLookupFailed) as exc:
            logger.warning("notifier: skipping %s, lookup failed: %s", email, exc)
            continue

        new_breaches = [b for b in fresh_breaches if b.breach_name not in known_names]
        if not new_breaches:
            continue

        risk = get_risk_scorer(settings.risk_model_path).score(fresh_breaches)
        masked_all = mask_all(fresh_breaches)
        inserted = (
            client.table("scans")
            .insert(
                {
                    "email": email,
                    "breaches": [b.model_dump() for b in masked_all],
                    "risk_score": risk.total,
                    "user_id": user_id,
                }
            )
            .execute()
        )
        new_scan_id = inserted.data[0]["id"]
        masked_new = mask_all(new_breaches)

        try:
            client.table("notifications").insert(
                {
                    "user_id": user_id,
                    "scan_id": new_scan_id,
                    "breach_names": [b.breach_name for b in masked_new],
                }
            ).execute()
        except Exception as exc:
            # Don't leave known_names silently advanced past a breach
            # nobody was actually told about — undo the scan snapshot so
            # the next run's diff still sees this as new and retries it.
            client.table("scans").delete().eq("id", new_scan_id).execute()
            logger.warning(
                "notifier: notification write failed for %s, rolled back scan %s: %s", email, new_scan_id, exc
            )
            continue

        if _email_alerts_enabled(client, user_id):
            try:
                send_breach_alert_email(email, masked_new, settings)
            except EmailNotConfigured:
                pass  # notification row still exists on the dashboard either way
            except Exception as exc:
                logger.warning("notifier: email delivery failed for %s: %s", email, exc)

        notified += 1

    return notified
