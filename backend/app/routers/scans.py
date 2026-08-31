from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr

from ..auth import CurrentUser, get_current_user, get_current_user_optional
from ..config import Settings, get_settings
from ..db import get_service_client
from ..rate_limit import limiter
from ..services.breach_lookup import BreachLookupFailed, BreachLookupNotConfigured, BreachRecord
from ..services.insights import InsightContent, InsightGenerationFailed, InsightNotConfigured, get_insight_generator
from ..services.risk_scoring import RiskResult, classify_risk
from ..services.scanning import run_and_record_scan
from ..services.usage import record_call

router = APIRouter(tags=["scans"])


class ScanIn(BaseModel):
    email: EmailStr


class ScanResult(BaseModel):
    id: str
    email: EmailStr
    breaches: list[BreachRecord]
    risk: RiskResult


class ScanRecordOut(BaseModel):
    id: str
    email: EmailStr
    breaches: list[BreachRecord]
    risk_score: int
    created_at: str


@router.post("/scans")
@limiter.limit("10/minute")
def create_scan(
    request: Request,
    payload: ScanIn,
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser | None = Depends(get_current_user_optional),
) -> ScanResult:
    """Runs a live breach lookup and computes the risk score server-side,
    then records the result. Public by design — Phase 1 stays reachable
    without signing in. Auth is optional, not absent: a request carrying a
    valid session (the common case once a user is signed in) records the
    scan against that account directly; a guest request still records an
    unlinked (user_id null) row that gets claimed on first verify, same as
    before. See migrations/0001_init.sql.

    The client sends only an email. It never supplies breaches or a risk
    score — both are computed here, from our own DeHashed/HIBP lookup and
    our own trained model, so nothing returned to the browser or written to
    the database ever originated from something the caller claimed. See
    breached-architecture blueprint §1 and §4.
    """
    try:
        result = run_and_record_scan(
            payload.email, settings, user_id=current_user.id if current_user else None
        )
    except BreachLookupNotConfigured as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Live breach lookup isn't configured in this environment yet "
                "(DEHASHED_API_KEY / HIBP_API_KEY missing). " + str(exc)
            ),
        ) from exc
    except BreachLookupFailed as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Breach lookup failed upstream and returned no usable result: {exc}",
        ) from exc

    return ScanResult(id=result.id, email=result.email, breaches=result.breaches, risk=result.risk)


@router.get("/scans/me")
def list_my_scans(current_user: CurrentUser = Depends(get_current_user)) -> list[ScanRecordOut]:
    """Protected read, reused as the pattern for every other dashboard data
    endpoint: the server independently re-verifies the JWT via
    get_current_user, then scopes the query to that user — never trusts a
    client-supplied user id."""
    client = get_service_client()
    result = (
        client.table("scans")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return [ScanRecordOut(**row) for row in result.data]


def get_owned_scan(scan_id: str, user_id: str | None) -> ScanRecordOut:
    """Ownership-scoped fetch shared by every endpoint that needs one scan.
    A scan that exists but belongs to someone else looks identical to one
    that doesn't exist at all (404, not 403) — this never confirms or
    denies another user's scan IDs.

    user_id=None means "guest" — scoped to scans.user_id IS NULL, the same
    unclaimed-guest-scan state POST /api/scans creates. This is what lets
    ResultsPage's PDF download work before sign-in: the scan_id is an
    unguessable UUID, and once the scan is claimed (see
    migrations/0001_init.sql's link-on-verify trigger) this path stops
    matching it, same as any other endpoint scoped to a specific user_id.
    """
    client = get_service_client()
    query = client.table("scans").select("*").eq("id", scan_id)
    query = query.is_("user_id", "null") if user_id is None else query.eq("user_id", user_id)
    result = query.limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No scan found with that ID.")
    return ScanRecordOut(**result.data[0])


@router.get("/scans/{scan_id}")
def get_scan(scan_id: str, current_user: CurrentUser = Depends(get_current_user)) -> ScanRecordOut:
    return get_owned_scan(scan_id, current_user.id)


@router.get("/scans/{scan_id}/insights")
def get_scan_insights(
    scan_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> InsightContent:
    """Generate-or-fetch-cached. The first request for a given scan pays
    the Claude API cost and caches the result in `insights`; every request
    after that is a plain database read."""
    scan = get_owned_scan(scan_id, current_user.id)
    client = get_service_client()

    cached = client.table("insights").select("content").eq("scan_id", scan_id).limit(1).execute()
    if cached.data:
        return InsightContent(**cached.data[0]["content"])

    try:
        generator = get_insight_generator(settings.anthropic_api_key)
        record_call("ai_insight", settings.daily_insight_warning_threshold)
        content = generator.generate(
            email=scan.email,
            breaches=[b.model_dump() for b in scan.breaches],
            risk_total=scan.risk_score,
            classification=classify_risk(scan.risk_score),
        )
    except InsightNotConfigured as exc:
        raise HTTPException(
            status_code=503,
            detail=f"AI insights aren't configured in this environment yet (ANTHROPIC_API_KEY missing). {exc}",
        ) from exc
    except InsightGenerationFailed as exc:
        raise HTTPException(status_code=502, detail=f"Insight generation failed: {exc}") from exc

    client.table("insights").insert(
        {"scan_id": scan_id, "user_id": current_user.id, "content": content.model_dump()}
    ).execute()
    return content
