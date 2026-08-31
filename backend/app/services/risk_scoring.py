"""Turns a list of BreachRecords into a 0-100 risk score.

Runs in-process — the trained model is a ~100KB joblib file loaded once per
worker, not a network hop (see blueprint §2: this is deliberately not a
microservice). Feature extraction must stay identical between here and
scripts/train_risk_model.py, so the model is trained on exactly what it will
see at inference time; the training script imports extract_features from
this module rather than re-implementing it.
"""

import math
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path

import joblib
from pydantic import BaseModel

from .breach_lookup import BreachRecord
from .sensitivity import field_weight

FEATURE_ORDER = ["sensitivity_raw", "recency_raw", "frequency_raw", "severity_raw"]

_SEVERITY_WEIGHT = {"high": 3.0, "medium": 1.5, "low": 0.5}
_UNKNOWN_DATE_DAYS = 365 * 3  # treat an unknown breach date as ~3 years old
_RECENCY_HALF_LIFE_DAYS = 365.0  # a breach's recency contribution halves every year


class RiskResult(BaseModel):
    total: int
    sensitivity: int
    recency: int
    frequency: int
    severity: int
    classification: str


def _days_since(breach_date: str | None) -> float:
    if not breach_date:
        return _UNKNOWN_DATE_DAYS
    try:
        parsed = datetime.fromisoformat(breach_date.replace("Z", "+00:00")).date()
    except ValueError:
        return _UNKNOWN_DATE_DAYS
    return max((date.today() - parsed).days, 0)


def extract_features(breaches: list[BreachRecord]) -> dict[str, float]:
    """Raw, unbounded engineered features — the model learns how to weigh
    them, this function just measures them."""
    if not breaches:
        return {k: 0.0 for k in FEATURE_ORDER}

    sensitivity_raw = sum(max((field_weight(f) for f in b.exposed_fields), default=0.0) for b in breaches)
    recency_raw = sum(math.exp(-_days_since(b.breach_date) / _RECENCY_HALF_LIFE_DAYS) * 10 for b in breaches)
    frequency_raw = float(len(breaches))
    severity_raw = sum(_SEVERITY_WEIGHT.get(b.severity, 0.5) for b in breaches)

    return {
        "sensitivity_raw": sensitivity_raw,
        "recency_raw": recency_raw,
        "frequency_raw": frequency_raw,
        "severity_raw": severity_raw,
    }


def classify_risk(total: float) -> str:
    # Same 40 / 70 thresholds RiskGauge.tsx already uses on the frontend.
    if total >= 70:
        return "high"
    if total >= 40:
        return "moderate"
    return "low"


class RiskScorer:
    def __init__(self, model_path: Path):
        self._model = None
        if model_path.exists():
            self._model = joblib.load(model_path)

    def score(self, breaches: list[BreachRecord]) -> RiskResult:
        features = extract_features(breaches)

        if not breaches:
            return RiskResult(total=0, sensitivity=0, recency=0, frequency=0, severity=0, classification="low")

        if self._model is not None:
            vector = [[features[k] for k in FEATURE_ORDER]]
            total = float(self._model.predict(vector)[0])
        else:
            # No trained model on disk yet — fall back to the raw weighted
            # sum so the endpoint still works (with a cruder score) instead
            # of 500ing. `scripts/train_risk_model.py` replaces this path.
            total = sum(features.values())

        total = max(0.0, min(100.0, total))

        # Distribute the model's total across the four factors in proportion
        # to their raw contribution, so the breakdown always sums to the
        # total the model actually predicted.
        raw_sum = sum(features.values()) or 1.0
        sensitivity = round(total * features["sensitivity_raw"] / raw_sum)
        recency = round(total * features["recency_raw"] / raw_sum)
        frequency = round(total * features["frequency_raw"] / raw_sum)
        severity = round(total) - sensitivity - recency - frequency

        return RiskResult(
            total=round(total),
            sensitivity=sensitivity,
            recency=recency,
            frequency=frequency,
            severity=severity,
            classification=classify_risk(total),
        )


@lru_cache
def get_risk_scorer(model_path: str) -> RiskScorer:
    # Resolved relative to backend/ (the process's working directory when
    # run via `uvicorn app.main:app` from that folder).
    return RiskScorer(Path(model_path))
