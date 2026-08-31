"""Trains the risk-scoring model and saves it to backend/models/risk_model.joblib.

Run from backend/:

    .venv\\Scripts\\python.exe scripts\\train_risk_model.py

There's no real labeled dataset of "this exposure profile = this risk score"
— that would need actual incident outcomes over time, which nobody has yet.
Instead this generates synthetic exposure profiles and a hand-specified
"ground truth" formula with saturation (diminishing returns as exposure
piles up) and noise, then trains a GradientBoostingRegressor to recover that
relationship from the same four engineered features risk_scoring.py computes
at inference time. Swap generate_synthetic_dataset() for real historical
data the moment it exists; nothing else in risk_scoring.py needs to change.
"""

import math
import random
import sys
from datetime import date, timedelta
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.services.breach_lookup import BreachRecord
from app.services.risk_scoring import FEATURE_ORDER, extract_features
from app.services.sensitivity import SENSITIVITY_WEIGHTS, classify_severity

FIELD_POOL = list(SENSITIVITY_WEIGHTS.keys())


def _random_breach(rng: random.Random) -> BreachRecord:
    field_count = rng.randint(1, 5)
    fields = rng.sample(FIELD_POOL, field_count)
    days_ago = rng.choice([None, rng.randint(0, 30 * 12 * 6)])  # sometimes unknown date
    breach_date = None if days_ago is None else (date.today() - timedelta(days=days_ago)).isoformat()
    return BreachRecord(
        source="synthetic",
        breach_name=f"synthetic-{rng.randint(0, 10_000)}",
        breach_date=breach_date,
        exposed_fields=fields,
        severity=classify_severity(fields),
    )


def _synthetic_profile(rng: random.Random) -> list[BreachRecord]:
    # Skew towards fewer breaches — most emails aren't in dozens of leaks.
    breach_count = rng.choices([0, 1, 2, 3, 5, 8, 12], weights=[15, 30, 20, 15, 10, 6, 4])[0]
    return [_random_breach(rng) for _ in range(breach_count)]


def _ground_truth_total(features: dict[str, float], rng: random.Random) -> float:
    weighted = (
        0.55 * features["sensitivity_raw"]
        + 0.35 * features["recency_raw"]
        + 3.2 * features["frequency_raw"]
        + 2.1 * features["severity_raw"]
    )
    # Saturating curve: diminishing returns as exposure piles up, rather than
    # an unbounded linear score.
    saturated = 100 * (1 - math.exp(-weighted / 55))
    noisy = saturated + rng.gauss(0, 3.0)
    return max(0.0, min(100.0, noisy))


def generate_synthetic_dataset(n: int, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = random.Random(seed)
    X, y = [], []
    for _ in range(n):
        profile = _synthetic_profile(rng)
        features = extract_features(profile)
        X.append([features[k] for k in FEATURE_ORDER])
        y.append(_ground_truth_total(features, rng))
    return np.array(X), np.array(y)


def main() -> None:
    X, y = generate_synthetic_dataset(n=6000)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        random_state=42,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    print(f"Features: {FEATURE_ORDER}")
    print(f"Test R^2:  {r2_score(y_test, predictions):.3f}")
    print(f"Test MAE:  {mean_absolute_error(y_test, predictions):.2f} points")

    print("\nSample predictions (feature vector -> predicted / true):")
    for i in range(5):
        print(f"  {X_test[i].round(1).tolist()} -> {predictions[i]:.1f} / {y_test[i]:.1f}")

    out_path = BACKEND_ROOT / "models" / "risk_model.joblib"
    out_path.parent.mkdir(exist_ok=True)
    joblib.dump(model, out_path)
    print(f"\nSaved model to {out_path}")


if __name__ == "__main__":
    main()
