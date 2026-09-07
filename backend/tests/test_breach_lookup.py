from app.services.breach_lookup import BreachRecord, HIBPClient, _merge_by_breach_name, normalize_hibp_class


def test_normalize_hibp_class_known_mappings():
    assert normalize_hibp_class("Passwords") == "password"
    assert normalize_hibp_class("Email addresses") == "email"
    assert normalize_hibp_class("Social security numbers") == "ssn"


def test_normalize_hibp_class_unknown_falls_back_to_slug():
    assert normalize_hibp_class("Some Weird Field") == "some_weird_field"


def test_normalize_hibp_class_is_case_and_whitespace_insensitive():
    assert normalize_hibp_class("  PASSWORDS  ") == "password"


def _record(
    source: str, name: str, fields: list[str], breach_date: str | None = None, record_type: str = "breach"
) -> BreachRecord:
    return BreachRecord(
        source=source, breach_name=name, breach_date=breach_date, exposed_fields=fields, severity="low",
        record_type=record_type,
    )


def test_merge_by_breach_name_combines_exact_name_matches():
    records = [
        _record("DeHashed", "Adobe", ["email", "password"]),
        _record("HIBP", "Adobe", ["username"]),
    ]
    merged = _merge_by_breach_name(records)
    assert len(merged) == 1
    assert set(merged[0].exposed_fields) == {"email", "password", "username"}
    assert merged[0].source == "DeHashed + HIBP"


def test_merge_by_breach_name_is_case_insensitive():
    records = [_record("DeHashed", "Adobe", ["email"]), _record("HIBP", "adobe", ["username"])]
    assert len(_merge_by_breach_name(records)) == 1


def test_merge_by_breach_name_keeps_distinct_breaches_separate():
    records = [_record("DeHashed", "Adobe", ["email"]), _record("DeHashed", "Canva", ["username"])]
    assert len(_merge_by_breach_name(records)) == 2


def test_merge_by_breach_name_prefers_an_existing_known_date_over_a_missing_one():
    records = [_record("DeHashed", "Adobe", ["email"], breach_date="2013-10-04"), _record("HIBP", "Adobe", ["username"], breach_date=None)]
    merged = _merge_by_breach_name(records)
    assert merged[0].breach_date == "2013-10-04"


def test_merge_by_breach_name_keeps_stealer_log_tag_regardless_of_processing_order():
    # DeHashed defaults every record to "breach" — if it's processed first,
    # a naive merge would silently overwrite HIBP's "stealer_log" tag for
    # the same breach name.
    records = [_record("DeHashed", "Adobe", ["email"]), _record("HIBP", "Adobe", ["username"], record_type="stealer_log")]
    assert _merge_by_breach_name(records)[0].record_type == "stealer_log"

    reversed_records = [_record("HIBP", "Adobe", ["username"], record_type="stealer_log"), _record("DeHashed", "Adobe", ["email"])]
    assert _merge_by_breach_name(reversed_records)[0].record_type == "stealer_log"


def test_hibp_to_breach_records_tags_stealer_log_entries():
    entries = [
        {"Title": "RedLine Stealer Logs", "DataClasses": ["Passwords"], "IsStealerLog": True},
        {"Title": "Adobe", "DataClasses": ["Email addresses"], "IsStealerLog": False},
        {"Title": "Canva", "DataClasses": ["Usernames"]},
    ]
    records = HIBPClient(api_key="unused").to_breach_records(entries)
    by_name = {r.breach_name: r.record_type for r in records}
    assert by_name["RedLine Stealer Logs"] == "stealer_log"
    assert by_name["Adobe"] == "breach"
    assert by_name["Canva"] == "breach"
