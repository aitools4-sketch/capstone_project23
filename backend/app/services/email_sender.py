"""Transactional email via Resend's HTTP API. Separate from the SMTP
config Supabase Auth uses for magic links — that's Supabase sending its
own auth emails; this is our backend sending its own (breach alerts).
Mirrors breach_lookup.py's pattern: a NotConfigured exception when no key
is set, so a missing key degrades a feature instead of crashing it.
"""

import httpx

from ..config import Settings
from .breach_lookup import BreachRecord

RESEND_API_URL = "https://api.resend.com/emails"


class EmailNotConfigured(Exception):
    """Raised when RESEND_API_KEY is not set."""


def send_email(to: str, subject: str, html: str, settings: Settings) -> None:
    if not settings.resend_api_key:
        raise EmailNotConfigured("Set RESEND_API_KEY to send transactional email.")

    response = httpx.post(
        RESEND_API_URL,
        headers={"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"},
        json={"from": settings.resend_from_email, "to": [to], "subject": subject, "html": html},
        timeout=15,
    )
    response.raise_for_status()


def send_breach_alert_email(to: str, new_breaches: list[BreachRecord], settings: Settings) -> None:
    names = ", ".join(b.breach_name for b in new_breaches)
    html = (
        "<p>We found your email in a new data breach since your last scan on Breached:</p>"
        f"<p><strong>{names}</strong></p>"
        "<p>Sign in to your dashboard to see what was exposed and what to do next.</p>"
    )
    send_email(to, "Breached: new breach found for your monitored email", html, settings)
