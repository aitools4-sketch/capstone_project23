"""Shared field-sensitivity weights.

Both breach_lookup (to tag a record's severity) and risk_scoring (to compute
the sensitivity sub-score) need the same notion of "how bad is it that this
field type leaked" — defined once here so the two never drift apart.
"""

# 0-10 scale. Higher = worse to have exposed. Tuned by hand, not learned —
# this is a judgment call about harm, not a pattern the training data should
# discover on its own.
SENSITIVITY_WEIGHTS: dict[str, float] = {
    "password": 10.0,
    "password_hash": 6.0,
    "ssn": 10.0,
    "national_id": 10.0,
    "card_number": 9.0,
    "bank_account": 9.0,
    "session_cookie": 5.0,
    "security_question": 5.0,
    "autofill_data": 4.0,
    "date_of_birth": 3.0,
    "physical_address": 3.0,
    "phone_number": 3.0,
    "crypto_address": 6.0,
    "license_plate": 3.0,
    "ip_address": 1.5,
    "username": 1.0,
    "social_handle": 1.0,
    "company": 1.0,
    "email": 0.5,
    "url": 0.5,
}

DEFAULT_FIELD_WEIGHT = 1.5


def field_weight(field: str) -> float:
    return SENSITIVITY_WEIGHTS.get(field, DEFAULT_FIELD_WEIGHT)


def classify_severity(exposed_fields: list[str]) -> str:
    """Per-record severity, from the single most sensitive field it exposed."""
    if not exposed_fields:
        return "low"
    peak = max(field_weight(f) for f in exposed_fields)
    if peak >= 8:
        return "high"
    if peak >= 4:
        return "medium"
    return "low"
