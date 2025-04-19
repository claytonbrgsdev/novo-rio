from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.badge import Badge
from ..schemas.badge import BadgeCreate

def create_badge(db: Session, badge: BadgeCreate) -> Badge:
    db_badge = Badge(**badge.dict())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def get_badges(db: Session, player_id: int) -> List[Badge]:
    return db.query(Badge).filter(Badge.player_id == player_id).all()
