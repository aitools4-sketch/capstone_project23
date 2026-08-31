from pathlib import Path

from app.services.breach_lookup import BreachRecord
from app.services.risk_scoring import RiskScorer, classify_risk, extract_features


def _record(exposed_fields: list[str], severity: str = "high", breach_date: str | None = "2024-01-01") -> BreachRecord:
    return BreachRecord(
        source="DeHashed",
        breach_name="Example Co",
        breach_date=breach_date,
        exposed_fields=exposed_fields,
        severity=severity,
    )


def test_classify_risk_thresholds():
    assert classify_risk(0) == "low"
    assert classify_risk(39) == "low"
    assert classify_risk(40) == "moderate"
    assert classify_risk(69) == "moderate"
    assert classify_risk(70) == "high"
    assert classify_risk(100) == "high"


def test_extract_features_empty_breaches_is_all_zero():
    features = extract_features([])
    assert set(features.values()) == {0.0}


def test_extract_features_more_breaches_raises_frequency():
    one = extract_features([_record(["email"])])
    two = extract_features([_record(["email"]), _record(["username"])])
    assert two["frequency_raw"] > one["frequency_raw"]


def test_extract_features_older_breach_has_lower_recency_contribution():
    recent = extract_features([_record(["email"], breach_date="2024-01-01")])
    old = extract_features([_record(["email"], breach_date="2010-01-01")])
    assert recent["recency_raw"] > old["recency_raw"]


def test_risk_scorer_with_no_breaches_is_zero_and_low():
    scorer = RiskScorer(Path("models/risk_model.joblib"))
    result = scorer.score([])
    assert result.total == 0
    assert result.classification == "low"


def test_risk_scorer_breakdown_sums_to_total():
    scorer = RiskScorer(Path("models/risk_model.joblib"))
    breaches = [_record(["password", "ssn"]), _record(["email"], severity="low")]
    result = scorer.score(breaches)
    assert result.sensitivity + result.recency + result.frequency + result.severity == result.total
    assert 0 <= result.total <= 100
    assert result.classification == classify_risk(result.total)


def test_risk_scorer_falls_back_gracefully_without_a_model_file():
    scorer = RiskScorer(Path("models/does_not_exist.joblib"))
    result = scorer.score([_record(["password"])])
    assert 0 <= result.total <= 100
