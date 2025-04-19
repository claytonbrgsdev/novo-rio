from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.action import Action
from ..schemas.action import ActionCreate, ActionOut

def create_action(db: Session, action: ActionCreate) -> Action:
    db_action = Action(**action.dict())
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

def get_action(db: Session, action_id: int) -> Optional[Action]:
    return db.query(Action).filter(Action.id == action_id).first()

def get_actions(db: Session, skip: int = 0, limit: int = 100) -> List[Action]:
    return db.query(Action).offset(skip).limit(limit).all()
