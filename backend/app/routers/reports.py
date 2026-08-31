from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from postgrest.exceptions import APIError
from pydantic import BaseModel

from ..auth import CurrentUser, get_current_user_optional
from ..db import get_service_client
from ..rate_limit import limiter
from ..services.insights import InsightContent
from ..services.report_pdf import render_report_pdf
from ..services.risk_scoring import RiskResult, classify_risk
from .scans import get_owned_scan

router = APIRouter(tags=["reports"])


class ReportIn(BaseModel):
    scan_id: str


@router.post("/reports/pdf")
@limiter.limit("10/minute")
def download_report_pdf(
    request: Request,
    payload: ReportIn,
    current_user: CurrentUser | None = Depends(get_current_user_optional),
) -> Response:
    """Body is just a scan_id — never a client-assembled payload. Everything
    in the PDF is re-fetched from the database here, so a downloaded report
    can never contain numbers the server didn't itself compute. See
    breached-architecture blueprint §6's recommended contract change.

    Auth is optional on purpose: ResultsPage lets a guest download a report
    for the scan they just ran, before signing in. get_owned_scan enforces
    the actual boundary — a signed-in caller only ever gets their own
    scans, a guest caller only ever gets still-unclaimed ones.

    Doesn't generate a new AI insight on demand: that would make a PDF
    download silently trigger paid API spend. If an insight was already
    generated (see scans.py's insights endpoint), it's included; otherwise
    the PDF just omits that section — including when the insights table
    itself isn't reachable (e.g. its migration hasn't been applied yet).
    The core report (email, risk score, breach table) has nothing to do
    with that feature and must never fail because of it.
    """
    scan = get_owned_scan(payload.scan_id, current_user.id if current_user else None)

    client = get_service_client()
    insight: InsightContent | None = None
    try:
        cached = client.table("insights").select("content").eq("scan_id", payload.scan_id).limit(1).execute()
        if cached.data:
            insight = InsightContent(**cached.data[0]["content"])
    except APIError:
        pass

    risk = RiskResult(
        total=scan.risk_score,
        sensitivity=0,
        recency=0,
        frequency=0,
        severity=0,
        classification=classify_risk(scan.risk_score),
    )

    pdf_bytes = render_report_pdf(
        email=scan.email,
        scan_created_at=scan.created_at,
        breaches=scan.breaches,
        risk=risk,
        insight=insight,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="identity-risk-report.pdf"'},
    )
