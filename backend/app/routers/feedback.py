from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import CurrentUser, get_current_user
from ..db import get_service_client

router = APIRouter(prefix="/feedback", tags=["feedback"])

# How many of the best-rated, commented entries to surface on the homepage.
FEATURED_COUNT = 3
# How many candidates to pull before filtering for a non-empty comment —
# wide enough that a handful of star-only (no comment) rows near the top
# don't starve the featured list, without scanning the whole table.
FEATURED_CANDIDATE_POOL = 50


class FeedbackIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class FeedbackOut(BaseModel):
    id: str
    rating: int
    comment: str | None
    created_at: str


class FeaturedFeedbackOut(BaseModel):
    rating: int
    comment: str


@router.post("")
def submit_feedback(payload: FeedbackIn, current_user: CurrentUser = Depends(get_current_user)) -> FeedbackOut:
    client = get_service_client()
    comment = payload.comment.strip() if payload.comment and payload.comment.strip() else None
    row = (
        client.table("feedback")
        .insert({"user_id": current_user.id, "rating": payload.rating, "comment": comment})
        .execute()
        .data[0]
    )
    return FeedbackOut(**row)


@router.get("/featured")
def list_featured_feedback() -> list[FeaturedFeedbackOut]:
    """Public — no user identity is returned, only rating and comment text.
    Used by the homepage testimonials section."""
    client = get_service_client()
    rows = (
        client.table("feedback")
        .select("rating,comment")
        .order("rating", desc=True)
        .order("created_at", desc=True)
        .limit(FEATURED_CANDIDATE_POOL)
        .execute()
        .data
    )
    commented = [row for row in rows if row.get("comment") and row["comment"].strip()]
    return [FeaturedFeedbackOut(rating=row["rating"], comment=row["comment"]) for row in commented[:FEATURED_COUNT]]
