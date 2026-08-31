from app.services.sensitivity import classify_severity, field_weight


def test_field_weight_known_field():
    assert field_weight("password") == 10.0
    assert field_weight("email") == 0.5


def test_field_weight_unknown_field_falls_back_to_default():
    assert field_weight("something_not_in_the_table") == 1.5


def test_classify_severity_empty_is_low():
    assert classify_severity([]) == "low"


def test_classify_severity_uses_the_single_most_sensitive_field():
    # password (10.0) outweighs email (0.5) — severity tracks the worst
    # field present, not an average.
    assert classify_severity(["email", "password"]) == "high"


def test_classify_severity_thresholds():
    assert classify_severity(["password"]) == "high"  # 10.0 >= 8
    assert classify_severity(["autofill_data"]) == "medium"  # 4.0 >= 4
    assert classify_severity(["email"]) == "low"  # 0.5 < 4
