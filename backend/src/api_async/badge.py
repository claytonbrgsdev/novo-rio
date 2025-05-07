from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.badge import create_badge, get_badges
from ..schemas.badge import BadgeCreate, BadgeOut

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/async/badges", tags=["badges"])

@router.post("/", response_model=BadgeOut)
def create_badge_endpoint(
    badge: BadgeCreate,
    db: Session = Depends(get_db)
):
    """
    Endpoint para criar badge
    """
    return create_badge(db, badge)

@router.get("/", response_model=List[BadgeOut])
def list_badges_endpoint(
    player_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint para listar badges de um jogador
    """
    return get_badges(db, player_id)
