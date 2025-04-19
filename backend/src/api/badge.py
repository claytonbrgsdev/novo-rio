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

@router.post("/", response_model=BadgeOut)
async def create_badge_endpoint(badge: BadgeCreate, db: Session = Depends(get_db)):
    return await run_in_threadpool(create_badge, db, badge)

@router.get("/", response_model=List[BadgeOut])
async def list_badges(player_id: int, db: Session = Depends(get_db)):
    badges = await run_in_threadpool(get_badges, db, player_id)
    if not badges:
        return []
    return badges
