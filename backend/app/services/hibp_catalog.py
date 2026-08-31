"""HIBP's breach catalog — 'all breached sites in the system', not tied to
any single email. Unlike breach_lookup.py's HIBPClient, these endpoints
(/breaches, /breach/{name}) are public per HIBP's own docs: no hibp-api-key
required, just a User-Agent. Powers the public Breach Intelligence page.

Cached in-process with a simple TTL — this catalog changes on the order of
days/weeks, and fetching ~1000 entries from HIBP on every visitor's page
load would be both slow and impolite given HIBP's own guidance to query
infrequently.
"""

import time
from typing import Any

import httpx
from pydantic import BaseModel

from .breach_lookup import normalize_hibp_class
from .sensitivity import classify_severity

BASE_URL = "https://haveibeenpwned.com/api/v3"
_USER_AGENT = "Breached-Scanner/1.0"
_CACHE_TTL_SECONDS = 60 * 60  # 1 hour


class CatalogBreach(BaseModel):
    name: str
    title: str
    domain: str
    breach_date: str
    added_date: str
    pwn_count: int
    description: str
    data_classes: list[str]
    severity: str
    is_verified: bool
    is_sensitive: bool
    is_stealer_log: bool
    logo_path: str


def _to_catalog_breach(raw: dict[str, Any]) -> CatalogBreach:
    data_classes = [normalize_hibp_class(c) for c in raw.get("DataClasses", [])]
    return CatalogBreach(
        name=raw["Name"],
        title=raw.get("Title", raw["Name"]),
        domain=raw.get("Domain", ""),
        breach_date=raw.get("BreachDate", ""),
        added_date=raw.get("AddedDate", ""),
        pwn_count=raw.get("PwnCount", 0),
        description=raw.get("Description", ""),
        data_classes=raw.get("DataClasses", []),
        severity=classify_severity(data_classes),
        is_verified=raw.get("IsVerified", False),
        is_sensitive=raw.get("IsSensitive", False),
        is_stealer_log=raw.get("IsStealerLog", False),
        logo_path=raw.get("LogoPath", ""),
    )


_cache: dict[str, Any] = {"breaches": None, "fetched_at": 0.0}


def get_all_breaches(client: httpx.Client | None = None) -> list[CatalogBreach]:
    now = time.time()
    if _cache["breaches"] is not None and now - _cache["fetched_at"] < _CACHE_TTL_SECONDS:
        return _cache["breaches"]

    http = client or httpx.Client(timeout=15.0)
    response = http.get(f"{BASE_URL}/breaches", headers={"User-Agent": _USER_AGENT})
    response.raise_for_status()

    breaches = [_to_catalog_breach(b) for b in response.json() if not b.get("IsRetired")]
    _cache["breaches"] = breaches
    _cache["fetched_at"] = now
    return breaches


def get_breach(name: str, client: httpx.Client | None = None) -> CatalogBreach | None:
    # Prefer an already-warm cache — avoids a network call entirely for
    # anyone who visited the catalog list before clicking into a breach.
    cached = _cache["breaches"]
    if cached is not None and time.time() - _cache["fetched_at"] < _CACHE_TTL_SECONDS:
        match = next((b for b in cached if b.name.lower() == name.lower()), None)
        if match:
            return match

    http = client or httpx.Client(timeout=15.0)
    response = http.get(f"{BASE_URL}/breach/{name}", headers={"User-Agent": _USER_AGENT})
    if response.status_code == 404:
        return None
    response.raise_for_status()
    return _to_catalog_breach(response.json())
