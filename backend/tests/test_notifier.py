from app.services.notifier import _dedupe_latest_per_user


def test_dedupe_keeps_only_the_first_row_seen_per_user():
    # Rows must already arrive most-recent-first (order("created_at", desc=True))
    rows = [
        {"user_id": "u1", "created_at": "2026-01-02"},
        {"user_id": "u1", "created_at": "2026-01-01"},
        {"user_id": "u2", "created_at": "2026-01-02"},
    ]
    result = _dedupe_latest_per_user(rows)
    assert [r["user_id"] for r in result] == ["u1", "u2"]
    assert result[0]["created_at"] == "2026-01-02"


def test_dedupe_empty_input():
    assert _dedupe_latest_per_user([]) == []
