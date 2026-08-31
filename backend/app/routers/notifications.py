from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth import CurrentUser, get_current_user
from ..db import get_service_client

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: str
    scan_id: str
    breach_names: list[str]
    read: bool
    created_at: str


@router.get("/me")
def list_my_notifications(current_user: CurrentUser = Depends(get_current_user)) -> list[NotificationOut]:
    client = get_service_client()
    rows = (
        client.table("notifications")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return [NotificationOut(**row) for row in rows]


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str, current_user: CurrentUser = Depends(get_current_user)
) -> dict[str, str]:
    client = get_service_client()
    result = (
        client.table("notifications")
        .update({"read": True})
        .eq("id", notification_id)
        .eq("user_id", current_user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No notification found with that ID.")
    return {"status": "ok"}
