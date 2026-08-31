from app.services.breach_lookup import BreachRecord
from app.services.masking import mask_all, mask_for_response


def _record(exposed_fields: list[str]) -> BreachRecord:
    return BreachRecord(
        source="DeHashed",
        breach_name="Example Co",
        breach_date="2024-01-01",
        exposed_fields=exposed_fields,
        severity="high",
    )


def test_mask_for_response_maps_known_fields_to_display_labels():
    masked = mask_for_response(_record(["password", "email"]))
    assert "Plaintext password exposed" in masked.exposed_fields
    assert "Email address" in masked.exposed_fields


def test_mask_for_response_never_leaks_the_raw_internal_key():
    masked = mask_for_response(_record(["password"]))
    assert "password" not in masked.exposed_fields


def test_mask_for_response_falls_back_to_a_readable_label_for_unknown_fields():
    masked = mask_for_response(_record(["some_new_field_type"]))
    assert masked.exposed_fields == ["Some new field type"]


def test_mask_for_response_dedupes_and_sorts():
    # password and password again (e.g. after a merge) should not appear twice.
    masked = mask_for_response(_record(["password", "password"]))
    assert masked.exposed_fields == ["Plaintext password exposed"]


def test_mask_all_preserves_record_count_and_order_independent_fields():
    records = [_record(["password"]), _record(["email"])]
    masked = mask_all(records)
    assert len(masked) == 2
    assert masked[0].breach_name == "Example Co"
