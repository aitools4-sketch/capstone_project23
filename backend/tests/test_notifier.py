from app.services.notifier import _dedupe_latest_per_email, _email_alerts_enabled


class _FakeQuery:
    """Just enough of supabase-py's chainable query builder for
    _email_alerts_enabled's exact call shape (.table().select().eq().limit()
    .execute().data) — this module deliberately never mocks a full
    Supabase client (see _dedupe_latest_per_email's own tests, which test
    pure logic on plain dicts instead), so this stays minimal and local
    rather than growing into a shared fake."""

    def __init__(self, rows: list[dict]):
        self._rows = rows

    def table(self, _name):
        return self

    def select(self, _cols):
        return self

    def eq(self, _col, _value):
        return self

    def limit(self, _n):
        return self

    def execute(self):
        return self

    @property
    def data(self):
        return self._rows


def test_email_alerts_enabled_defaults_true_with_no_row():
    # No row is the common case — a user who never visited the setting.
    assert _email_alerts_enabled(_FakeQuery([]), "u1") is True


def test_email_alerts_enabled_reads_a_stored_false():
    assert _email_alerts_enabled(_FakeQuery([{"email_alerts_enabled": False}]), "u1") is False


def test_email_alerts_enabled_reads_a_stored_true():
    assert _email_alerts_enabled(_FakeQuery([{"email_alerts_enabled": True}]), "u1") is True


def test_dedupe_keeps_only_the_first_row_seen_per_email():
    # Rows must already arrive most-recent-first (order("created_at", desc=True)).
    # Keyed by email, not user_id, now that one account can monitor several
    # emails — each needs its own "latest known scan" baseline.
    rows = [
        {"email": "a@example.com", "created_at": "2026-01-02"},
        {"email": "a@example.com", "created_at": "2026-01-01"},
        {"email": "b@example.com", "created_at": "2026-01-02"},
    ]
    result = _dedupe_latest_per_email(rows)
    assert set(result.keys()) == {"a@example.com", "b@example.com"}
    assert result["a@example.com"]["created_at"] == "2026-01-02"


def test_dedupe_empty_input():
    assert _dedupe_latest_per_email([]) == {}
