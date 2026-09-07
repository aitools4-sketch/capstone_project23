from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr

from ..auth import CurrentUser, get_current_user
from ..config import Settings, get_settings
from ..rate_limit import limiter
from ..services.monitored_emails import (
    InvalidVerificationToken,
    MonitoredEmailLimitReached,
    add_monitored_email,
    list_monitored_emails,
    remove_monitored_email,
    verify_monitored_email,
)

router = APIRouter(prefix="/monitored-emails", tags=["monitored-emails"])


class MonitoredEmailOut(BaseModel):
    id: str
    email: str
    verified_at: str | None
    created_at: str


class AddMonitoredEmailIn(BaseModel):
    email: EmailStr


class VerifyMonitoredEmailIn(BaseModel):
    token: str


@router.get("/me")
def list_my_monitored_emails(current_user: CurrentUser = Depends(get_current_user)) -> list[MonitoredEmailOut]:
    return [MonitoredEmailOut(**row) for row in list_monitored_emails(current_user.id)]


@router.post("/me")
@limiter.limit("10/minute")
def add_my_monitored_email(
    request: Request,
    payload: AddMonitoredEmailIn,
    current_user: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> MonitoredEmailOut:
    try:
        row = add_monitored_email(current_user.id, payload.email, settings)
    except MonitoredEmailLimitReached as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return MonitoredEmailOut(**row)


@router.post("/verify")
@limiter.limit("10/minute")
def verify_my_monitored_email(request: Request, payload: VerifyMonitoredEmailIn) -> dict[str, str]:
    """Public by design — the token itself is the proof of ownership, same
    trust model as the magic-link `code` param AuthCallbackPage.tsx
    exchanges. No session is required or expected here."""
    try:
        verify_monitored_email(payload.token)
    except InvalidVerificationToken as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "verified"}


@router.delete("/{monitored_email_id}")
def delete_my_monitored_email(
    monitored_email_id: str, current_user: CurrentUser = Depends(get_current_user)
) -> dict[str, str]:
    removed = remove_monitored_email(current_user.id, monitored_email_id)
    if not removed:
        raise HTTPException(status_code=404, detail="No monitored email found with that ID.")
    return {"status": "removed"}
