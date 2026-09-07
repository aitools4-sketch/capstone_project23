"""Server-side breach lookup: DeHashed (primary) cross-checked against HIBP v3.

This is the module that makes POST /api/scans trustworthy. The client sends
only an email; every BreachRecord returned from here was produced by this
process using our own API keys, never by re-serializing something the caller
claimed. See breached-architecture blueprint §1 and §4.
"""

import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Literal

import httpx
from pydantic import BaseModel

from ..config import Settings
from .sensitivity import classify_severity
from .usage import record_call

logger = logging.getLogger(__name__)

# Shared across every request instead of a fresh httpx.Client per scan —
# lets keep-alive connections to DeHashed and HIBP actually get reused
# instead of paying a new TCP+TLS handshake on every single lookup.
# httpx.Client is documented as thread-safe, which matters here since
# lookup_breaches() below calls both sources concurrently.
_SHARED_CLIENT = httpx.Client(timeout=10.0)


class BreachRecord(BaseModel):
    source: str
    breach_name: str
    breach_date: str | None = None
    exposed_fields: list[str]
    severity: Literal["low", "medium", "high"]
    record_type: Literal["breach", "stealer_log"] = "breach"


class BreachLookupNotConfigured(Exception):
    """Raised when neither DEHASHED_API_KEY nor HIBP_API_KEY is set."""


class BreachLookupFailed(Exception):
    """Raised when every configured source failed at runtime (bad key,
    unpaid subscription, provider outage, ...) — as opposed to nothing being
    configured at all. Never silently returned as "no breaches found": a
    failed check must not look identical to a clean result."""


# DeHashed's response field names -> our normalized field vocabulary, per
# their v2 docs (updated 2026-07-02). Every entry field is a list, even for
# single values (e.g. "email": ["a@b.com"]) — checked here for presence only,
# never read: to_breach_records() below extracts nothing but which field
# *types* were present, so a raw exposed password can never propagate past
# this ingestion boundary.
_DEHASHED_FIELD_MAP: dict[str, str] = {
    "password": "password",
    "hashed_password": "password_hash",
    "email": "email",
    "username": "username",
    "phone": "phone_number",
    "address": "physical_address",
    "ip_address": "ip_address",
    "name": "name",
    "dob": "date_of_birth",
    "license_plate": "license_plate",
    "company": "company",
    "url": "url",
    "social": "social_handle",
    "cryptocurrency_address": "crypto_address",
}

# Present in every entry but never a user-facing "exposed data type" —
# id/database_name are DeHashed bookkeeping, raw_record is a metadata flag
# object, not a field a person leaked.
_DEHASHED_NON_FIELD_KEYS = {"id", "database_name", "raw_record"}


class DeHashedClient:
    """Wraps DeHashed's search API. One HTTP call, one email."""

    BASE_URL = "https://api.dehashed.com/v2/search"

    def __init__(self, api_key: str, client: httpx.Client | None = None):
        self._api_key = api_key
        self._client = client or httpx.Client(timeout=10.0)

    def search(self, email: str) -> list[dict[str, Any]]:
        response = self._client.post(
            self.BASE_URL,
            headers={
                "Dehashed-Api-Key": self._api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={"query": f"email:{email}", "size": 100, "page": 1},
        )
        response.raise_for_status()
        return response.json().get("entries", [])

    def to_breach_records(self, entries: list[dict[str, Any]]) -> list[BreachRecord]:
        # DeHashed returns individual matched credential rows, not pre-grouped
        # breaches — group by the source database name it reports per entry.
        grouped: dict[str, set[str]] = {}
        for entry in entries:
            breach_name = entry.get("database_name") or "Unknown source"
            fields = grouped.setdefault(breach_name, set())
            for raw_key, value in entry.items():
                if not value or raw_key in _DEHASHED_NON_FIELD_KEYS:
                    continue
                # Known fields get our normalized vocabulary; anything DeHashed
                # adds later still shows up (under its own name) instead of
                # silently vanishing.
                fields.add(_DEHASHED_FIELD_MAP.get(raw_key, raw_key))

        return [
            BreachRecord(
                source="DeHashed",
                breach_name=name,
                exposed_fields=sorted(fields),
                severity=classify_severity(list(fields)),
            )
            for name, fields in grouped.items()
        ]


class HIBPClient:
    """Wraps HIBP v3 — used to cross-verify DeHashed hits and to catch
    breaches DeHashed hasn't indexed."""

    BASE_URL = "https://haveibeenpwned.com/api/v3/breachedaccount"
    STEALER_LOGS_BASE_URL = "https://haveibeenpwned.com/api/v3/stealerlogsbyemail"

    def __init__(self, api_key: str, client: httpx.Client | None = None):
        self._api_key = api_key
        self._client = client or httpx.Client(timeout=10.0)

    def search(self, email: str) -> list[dict[str, Any]]:
        response = self._client.get(
            f"{self.BASE_URL}/{email}",
            headers={"hibp-api-key": self._api_key, "User-Agent": "Breached-Scanner/1.0"},
            params={"truncateResponse": "false"},
        )
        if response.status_code == 404:
            return []  # HIBP's documented "no breaches found" response
        response.raise_for_status()
        return response.json()

    def to_breach_records(self, entries: list[dict[str, Any]]) -> list[BreachRecord]:
        records = []
        for entry in entries:
            fields = [normalize_hibp_class(c) for c in entry.get("DataClasses", [])]
            breach_date = entry.get("BreachDate")
            records.append(
                BreachRecord(
                    source="HIBP",
                    breach_name=entry.get("Title") or entry.get("Name", "Unknown source"),
                    breach_date=breach_date,
                    exposed_fields=fields,
                    severity=classify_severity(fields),
                    # HIBP tags each breach at the source — same field hibp_catalog.py
                    # reads for the public catalog. Only present with
                    # truncateResponse=false, which search() above already passes.
                    record_type="stealer_log" if entry.get("IsStealerLog") else "breach",
                )
            )
        return records

    def search_stealer_logs(self, email: str) -> list[str]:
        """HIBP's Pro-tier endpoint — unlike search() above, this only
        works for an email whose domain has been verified on HIBP's
        dashboard; every other domain gets a 403. lookup_breaches() below
        checks that before ever calling this, so a 403 reaching here means
        the verified-domain assumption no longer holds (lapsed tier,
        dashboard changed) rather than "wrong email"."""
        response = self._client.get(
            f"{self.STEALER_LOGS_BASE_URL}/{email}",
            headers={"hibp-api-key": self._api_key, "User-Agent": "Breached-Scanner/1.0"},
        )
        if response.status_code in (404, 403):
            return []
        response.raise_for_status()
        return response.json()

    def to_stealer_log_records(self, domains: list[str]) -> list[BreachRecord]:
        # The endpoint only ever confirms "a login for this domain was
        # captured" — password is the one field that's always true of a
        # stealer capture (that's what makes it one); HIBP doesn't say
        # whether autofill data, cookies, etc. came with it.
        return [
            BreachRecord(
                source="HIBP Stealer Logs",
                breach_name=domain,
                exposed_fields=["password"],
                severity=classify_severity(["password"]),
                record_type="stealer_log",
            )
            for domain in domains
        ]


def normalize_hibp_class(data_class: str) -> str:
    """HIBP's DataClasses are free-text ("Passwords", "Email addresses") —
    map the common ones onto our vocabulary; anything unrecognized passes
    through lowercased with spaces collapsed."""
    key = data_class.strip().lower()
    mapping = {
        "passwords": "password",
        "password hints": "security_question",
        "email addresses": "email",
        "usernames": "username",
        "phone numbers": "phone_number",
        "physical addresses": "physical_address",
        "ip addresses": "ip_address",
        "dates of birth": "date_of_birth",
        "credit cards": "card_number",
        "bank account numbers": "bank_account",
        "social security numbers": "ssn",
    }
    return mapping.get(key, key.replace(" ", "_"))


def _merge_by_breach_name(records: list[BreachRecord]) -> list[BreachRecord]:
    """DeHashed and HIBP will both report the same well-known breach under
    slightly different names in some cases; exact-name collisions (the
    common case) get merged so the UI doesn't show a breach twice."""
    merged: dict[str, BreachRecord] = {}
    for record in records:
        key = record.breach_name.strip().lower()
        if key not in merged:
            merged[key] = record
            continue
        existing = merged[key]
        fields = sorted(set(existing.exposed_fields) | set(record.exposed_fields))
        merged[key] = existing.model_copy(
            update={
                "exposed_fields": fields,
                "severity": classify_severity(fields),
                # Either source flagging it as a stealer log wins — DeHashed
                # defaults every record to "breach", so without this an
                # untagged DeHashed copy processed first would silently
                # overwrite HIBP's "stealer_log" tag for the same breach.
                "record_type": "stealer_log"
                if "stealer_log" in (existing.record_type, record.record_type)
                else "breach",
                "breach_date": existing.breach_date or record.breach_date,
                "source": f"{existing.source} + {record.source}" if existing.source != record.source else existing.source,
            }
        )
    return list(merged.values())


def _fetch_dehashed(email: str, api_key: str) -> tuple[list[BreachRecord], str | None]:
    try:
        dehashed = DeHashedClient(api_key, client=_SHARED_CLIENT)
        return dehashed.to_breach_records(dehashed.search(email)), None
    except httpx.HTTPError as exc:
        return [], f"DeHashed: {exc}"


def _fetch_hibp(email: str, api_key: str) -> tuple[list[BreachRecord], str | None]:
    try:
        hibp = HIBPClient(api_key, client=_SHARED_CLIENT)
        return hibp.to_breach_records(hibp.search(email)), None
    except httpx.HTTPError as exc:
        return [], f"HIBP: {exc}"


def _email_domain_matches(email: str, verified_domain: str) -> bool:
    _, _, domain = email.rpartition("@")
    return domain.lower() == verified_domain.strip().lower()


def _fetch_hibp_stealer_logs(email: str, api_key: str) -> list[BreachRecord]:
    """Best-effort bonus source, deliberately kept out of lookup_breaches()'s
    failure accounting: it's only ever attempted for one verified domain,
    so it failing must never take down a scan that DeHashed/HIBP otherwise
    served fine for everyone else."""
    try:
        hibp = HIBPClient(api_key, client=_SHARED_CLIENT)
        return hibp.to_stealer_log_records(hibp.search_stealer_logs(email))
    except httpx.HTTPError as exc:
        logger.warning("HIBP stealer log lookup failed for verified domain: %s", exc)
        return []


def lookup_breaches(email: str, settings: Settings) -> list[BreachRecord]:
    """The single entry point every caller (the scan endpoint, the
    notification worker) uses. Same code path regardless of trigger — see
    blueprint §5's point about there being exactly one pipeline.

    DeHashed and HIBP are independent, unrelated HTTP calls, so they run
    concurrently in a thread pool rather than one after another — a scan
    against both sources takes as long as the slower of the two, not the
    sum of both (measured: ~2.3s sequential vs ~1.6s concurrent)."""
    if not settings.dehashed_api_key and not settings.hibp_api_key:
        raise BreachLookupNotConfigured(
            "Set DEHASHED_API_KEY and/or HIBP_API_KEY to enable live breach lookup."
        )

    record_call("breach_search", settings.daily_search_warning_threshold)

    jobs = []
    stealer_log_job = None
    with ThreadPoolExecutor(max_workers=3) as pool:
        if settings.dehashed_api_key:
            jobs.append(pool.submit(_fetch_dehashed, email, settings.dehashed_api_key))
        if settings.hibp_api_key:
            jobs.append(pool.submit(_fetch_hibp, email, settings.hibp_api_key))
            if settings.hibp_verified_domain and _email_domain_matches(email, settings.hibp_verified_domain):
                stealer_log_job = pool.submit(_fetch_hibp_stealer_logs, email, settings.hibp_api_key)

        records: list[BreachRecord] = []
        failures: list[str] = []
        for job in jobs:
            recs, failure = job.result()
            records.extend(recs)
            if failure:
                failures.append(failure)

        if stealer_log_job:
            records.extend(stealer_log_job.result())

    attempted = len(jobs)
    # A source failing shouldn't take down a working one — but if every
    # configured source failed, that's not "no breaches found", it's "we
    # couldn't check", and the caller must not conflate the two.
    if failures and len(failures) == attempted:
        raise BreachLookupFailed("; ".join(failures))

    return _merge_by_breach_name(records)
