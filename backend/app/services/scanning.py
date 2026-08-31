"""Shared core for turning an email into a persisted scan row. Used by the
public POST /api/scans endpoint and by the notifier's periodic re-scans
(see notifier.py), so there is exactly one place that looks up breaches,
scores risk, masks fields, and writes to the scans table.
"""

from dataclasses import dataclass

from ..config import Settings
from ..db import get_service_client
from .breach_lookup import BreachRecord, lookup_breaches
from .masking import mask_all
from .risk_scoring import RiskResult, get_risk_scorer


@dataclass
class ScanRun:
    id: str
    email: str
    breaches: list[BreachRecord]
    risk: RiskResult


def run_and_record_scan(email: str, settings: Settings, user_id: str | None = None) -> ScanRun:
    """Raises BreachLookupNotConfigured / BreachLookupFailed (see
    breach_lookup.py) — callers decide how to translate those, since a
    public endpoint and a background job need different handling."""
    raw_breaches = lookup_breaches(email, settings)
    risk = get_risk_scorer(settings.risk_model_path).score(raw_breaches)
    masked_breaches = mask_all(raw_breaches)

    client = get_service_client()
    inserted = client.table("scans").insert(
        {
            "email": email,
            "breaches": [b.model_dump() for b in masked_breaches],
            "risk_score": risk.total,
            "user_id": user_id,
        }
    ).execute()

    return ScanRun(id=inserted.data[0]["id"], email=email, breaches=masked_breaches, risk=risk)
