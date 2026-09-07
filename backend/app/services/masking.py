"""Redacts breach records to display-safe labels before they leave the
server — RA 10173 §5's data minimization requirement, enforced server-side
rather than trusted to the frontend.

The upstream boundary is actually in breach_lookup.py: DeHashedClient and
HIBPClient only ever extract field *types* ("password" was present) from
provider responses, never the raw value itself, so there is no plaintext
password sitting in a BreachRecord waiting to be hidden. This module's job is
the second half — turning internal type keys into labels a user can act on
without ever implying we're showing them the actual leaked value.
"""

from .breach_lookup import BreachRecord

FIELD_DISPLAY_LABELS: dict[str, str] = {
    "password": "Plaintext password exposed",
    "password_hash": "Hashed password exposed",
    "ssn": "Government ID exposed",
    "national_id": "Government ID exposed",
    "card_number": "Payment card exposed",
    "bank_account": "Bank account exposed",
    "session_cookie": "Session cookie exposed",
    "security_question": "Security question / hint",
    "autofill_data": "Saved autofill data",
    "date_of_birth": "Date of birth",
    "physical_address": "Physical address",
    "phone_number": "Phone number",
    "ip_address": "IP address",
    "username": "Username",
    "email": "Email address",
    "name": "Full name",
    "crypto_address": "Cryptocurrency address exposed",
    "license_plate": "License plate",
    "company": "Employer / company",
    "url": "Linked URL",
    "social_handle": "Social media handle",
}


def mask_for_response(record: BreachRecord) -> BreachRecord:
    labels = [FIELD_DISPLAY_LABELS.get(field, field.replace("_", " ").capitalize()) for field in record.exposed_fields]
    return record.model_copy(update={"exposed_fields": sorted(set(labels))})


def mask_all(records: list[BreachRecord]) -> list[BreachRecord]:
    return [mask_for_response(r) for r in records]


# Keep in sync with frontend/src/pages/ResultsPage.tsx's PREVIEW_BREACH_COUNT
# — that's the number of rows the guest results page already renders
# (blurred) today. This makes that limit real at the network layer instead
# of trusting a CSS blur someone could read past via devtools.
GUEST_PREVIEW_COUNT = 6


def mask_for_guest(records: list[BreachRecord]) -> list[BreachRecord]:
    """What an unauthenticated scan response includes: the labels are
    already display-safe via mask_all, this just caps how many records
    come with them. The true count still travels separately
    (ScanResult.total_breach_count in routers/scans.py) — this only limits
    which entries carry full name/date/field detail."""
    return mask_all(records)[:GUEST_PREVIEW_COUNT]
