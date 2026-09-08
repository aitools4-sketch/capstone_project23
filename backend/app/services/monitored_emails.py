"""Multiple monitored emails per account, gated by ownership proof.

There's no decoupled "verify this email" primitive elsewhere to reuse —
frontend/src/lib/authProvider.tsx's requestMagicLink() calls Supabase's
signInWithOtp with shouldCreateUser: true, which *is* full account
sign-in/creation, not a standalone confirmation, and misusing it here would
mean creating a second auth user for what should stay one account. So this
is its own simple token-based confirmation over the existing transactional
email pipeline (email_sender.py, already Resend-backed).
"""

import logging
import uuid
from datetime import datetime, timezone

from ..config import Settings
from ..db import get_service_client
from .email_sender import EmailNotConfigured, send_email

logger = logging.getLogger(__name__)

MAX_MONITORED_EMAILS = 5


class MonitoredEmailLimitReached(Exception):
    """Raised when an account already has MAX_MONITORED_EMAILS rows —
    caps how many confirmation emails one account can trigger."""


class InvalidVerificationToken(Exception):
    """Raised when a verify request's token matches no pending row."""


def list_monitored_emails(user_id: str) -> list[dict]:
    client = get_service_client()
    return (
        client.table("monitored_emails")
        .select("id, email, verified_at, created_at")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
        .data
    )


def add_monitored_email(user_id: str, email: str, settings: Settings) -> dict:
    client = get_service_client()

    existing_count = (
        client.table("monitored_emails").select("id", count="exact").eq("user_id", user_id).execute().count
    )
    if existing_count is not None and existing_count >= MAX_MONITORED_EMAILS:
        raise MonitoredEmailLimitReached(f"Accounts can monitor up to {MAX_MONITORED_EMAILS} emails.")

    token = uuid.uuid4()
    inserted = (
        client.table("monitored_emails")
        .insert({"user_id": user_id, "email": email, "verification_token": str(token)})
        .execute()
    )
    row = inserted.data[0]

    verify_url = f"{settings.frontend_url}/monitored-emails/verify?token={token}"
    html = (
        f"<p>Someone (hopefully you) asked Breached to monitor <strong>{email}</strong> "
        "for data breaches.</p>"
        f'<p><a href="{verify_url}">Confirm this email</a> to start monitoring it. '
        "If you didn't request this, ignore this message and nothing will be monitored.</p>"
    )
    # The row is already committed above — a failure here (missing key, or a
    # sandbox Resend account that can only deliver to its own verified
    # address) must not look like the whole add failed and must not orphan
    # the row in limbo with no way to tell the caller what happened. It's
    # still real and still pending; only the email attempt was best-effort.
    try:
        send_email(email, "Confirm this email for breach monitoring", html, settings)
    except EmailNotConfigured:
        logger.warning("monitored_emails: RESEND_API_KEY not set, no confirmation email sent to %s", email)
    except Exception as exc:
        logger.warning("monitored_emails: confirmation email failed for %s: %s", email, exc)

    return row


def verify_monitored_email(token: str) -> None:
    client = get_service_client()
    rows = (
        client.table("monitored_emails")
        .select("id")
        .eq("verification_token", token)
        .is_("verified_at", "null")
        .limit(1)
        .execute()
        .data
    )
    if not rows:
        raise InvalidVerificationToken("This verification link is invalid or has already been used.")

    # Single-use: clearing the token means the same link can't verify twice
    # or be replayed once acted on.
    client.table("monitored_emails").update(
        {"verified_at": datetime.now(timezone.utc).isoformat(), "verification_token": None}
    ).eq("id", rows[0]["id"]).execute()


def remove_monitored_email(user_id: str, monitored_email_id: str) -> bool:
    client = get_service_client()
    result = (
        client.table("monitored_emails")
        .delete()
        .eq("id", monitored_email_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(result.data)
