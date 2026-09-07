from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..auth import CurrentUser, get_current_user
from ..db import get_service_client

router = APIRouter(prefix="/notification-preferences", tags=["notification-preferences"])


class NotificationPreferencesOut(BaseModel):
    email_alerts_enabled: bool


class NotificationPreferencesIn(BaseModel):
    email_alerts_enabled: bool


@router.get("/me")
def get_my_notification_preferences(
    current_user: CurrentUser = Depends(get_current_user),
) -> NotificationPreferencesOut:
    client = get_service_client()
    rows = (
        client.table("notification_preferences")
        .select("email_alerts_enabled")
        .eq("user_id", current_user.id)
        .limit(1)
        .execute()
        .data
    )
    # No row is the common case (most users never visit this setting) and
    # means "unchanged from the default" — enabled, same as before this
    # feature existed — not "unconfigured."
    enabled = rows[0]["email_alerts_enabled"] if rows else True
    return NotificationPreferencesOut(email_alerts_enabled=enabled)


@router.put("/me")
def update_my_notification_preferences(
    payload: NotificationPreferencesIn, current_user: CurrentUser = Depends(get_current_user)
) -> NotificationPreferencesOut:
    client = get_service_client()
    client.table("notification_preferences").upsert(
        {"user_id": current_user.id, "email_alerts_enabled": payload.email_alerts_enabled}
    ).execute()
    return NotificationPreferencesOut(email_alerts_enabled=payload.email_alerts_enabled)
