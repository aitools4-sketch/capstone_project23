"""Periodic re-scan worker (blueprint Phase 3). Re-checks every signed-in
user's most recently scanned email against fresh breach data, and for
anyone with a breach that wasn't there last time, records a new scan
snapshot, writes a notification row, and emails an alert.

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


def _dedupe_latest_per_user(rows: list[dict]) -> list[dict]:
    """rows must already be ordered most-recent-first. Pulled out of
    _latest_scan_per_user so the dedup rule is testable without a live
    Supabase client — see tests/test_notifier.py."""
    seen: set[str] = set()
    latest = []
    for row in rows:
        if row["user_id"] not in seen:
            seen.add(row["user_id"])
            latest.append(row)
    return latest


def _latest_scan_per_user(client) -> list[dict]:
    """One row per user_id: their most recent scan. supabase-py has no
    "distinct on" through the REST client, so this dedupes client-side —
    fine at this project's scale (one row per user, not per scan)."""
    rows = (
        client.table("scans")
        .select("*")
        .not_.is_("user_id", "null")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return _dedupe_latest_per_user(rows)


def check_for_new_breaches(settings: Settings) -> int:
    """Runs one full pass over every user. Returns how many got a new
    notification, for logging visibility into each scheduled run."""
    client = get_service_client()
    notified = 0

    for scan in _latest_scan_per_user(client):
        user_id, email = scan["user_id"], scan["email"]
        # A handful of pre-Phase-1 rows predate the current BreachRecord
        # shape entirely (client-submitted mock data from before breach
        # detection moved server-side) — skip anything that doesn't look
        # like a real breach entry rather than letting one bad row crash
        # the whole run.
        known_names = {b["breach_name"] for b in scan["breaches"] if "breach_name" in b}

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

        try:
            send_breach_alert_email(email, masked_new, settings)
        except EmailNotConfigured:
            pass  # notification row still exists on the dashboard either way
        except Exception as exc:
            logger.warning("notifier: email delivery failed for %s: %s", email, exc)

        notified += 1

    return notified
