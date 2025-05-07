from typing import List
from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.badge import create_badge, get_badges
from ..schemas.badge import BadgeCreate, BadgeOut

router = APIRouter(prefix="/badges", tags=["badges"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BadgeOut,
             summary="Create Badge",
             description="Grants a badge to a player.\n\nExample request:\n```json\n{ \"player_id\": 1, \"type\": \"FirstPlant\" }\n```")
async def create_badge_endpoint(badge: BadgeCreate, db: Session = Depends(get_db)):
    """Creates a new badge for a player."""
    return await run_in_threadpool(create_badge, db, badge)

@router.get("/", response_model=List[BadgeOut],
            summary="List Badges",
            description="Retrieves all badges for a given player ID.\n\nExample path: `/badges?player_id=1`\nExample response:\n```json\n[{ \"id\": 1, \"player_id\": 1, \"action_name\": \"FirstPlant\", \"timestamp\": \"2025-04-20T13:00:00\" }]\n```")
async def list_badges(player_id: int, db: Session = Depends(get_db)):
    """Returns badges belonging to a player."""
    badges = await run_in_threadpool(get_badges, db, player_id)
    if not badges:
        return []
