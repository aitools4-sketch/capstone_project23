from fastapi import APIRouter, Depends, Request

from ..auth import CurrentUser, get_current_user
from ..db import get_service_client
from ..rate_limit import limiter

router = APIRouter(prefix="/account", tags=["account"])


@router.get("/export")
@limiter.limit("5/minute")
def export_account_data(request: Request, current_user: CurrentUser = Depends(get_current_user)) -> dict:
    """Everything this account holds about the user, in one JSON document.
    Privacy Policy §7's portability right — see deploy checklist Phase F."""
    client = get_service_client()

    scans = client.table("scans").select("*").eq("user_id", current_user.id).execute().data
    insights = client.table("insights").select("*").eq("user_id", current_user.id).execute().data
    notify_subscriptions = (
        client.table("notify_subscriptions").select("*").eq("user_id", current_user.id).execute().data
    )

    return {
        "account": {"id": current_user.id, "email": current_user.email},
        "scans": scans,
        "insights": insights,
        "notify_subscriptions": notify_subscriptions,
    }


@router.delete("")
@limiter.limit("3/minute")
def delete_account(request: Request, current_user: CurrentUser = Depends(get_current_user)) -> dict[str, str]:
    """Deletes the Supabase Auth user outright. Every scans/insights/
    notify_subscriptions row referencing this user_id cascades away with it
    (each FK is `on delete cascade`, see migrations/0001_init.sql and
    0002_insights.sql) — nothing here manually cleans up child tables, so
    there's no path where the auth user is gone but scan rows linger.
    Privacy Policy §9's deletion right — see deploy checklist Phase F."""
    client = get_service_client()
    client.auth.admin.delete_user(current_user.id)
    return {"status": "deleted"}
