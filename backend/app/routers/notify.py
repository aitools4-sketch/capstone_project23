from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

from ..db import get_service_client
from ..rate_limit import limiter

router = APIRouter(tags=["notify"])


class NotifyIn(BaseModel):
    email: EmailStr


@router.post("/notify")
@limiter.limit("10/minute")
def create_notify_subscription(request: Request, payload: NotifyIn) -> dict[str, str]:
    """Records a guest "Get Notified" signup. Public by design. Stays
    unlinked (user_id null) until the email verifies for the first time."""
    client = get_service_client()
    client.table("notify_subscriptions").insert({"email": payload.email, "user_id": None}).execute()
    return {"status": "recorded"}
