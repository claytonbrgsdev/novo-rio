from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.climate_condition import ClimateCondition
from ..schemas.climate_condition import ClimateConditionCreate, ClimateConditionOut

def create_climate_condition(db: Session, cc: ClimateConditionCreate) -> ClimateCondition:
    db_cc = ClimateCondition(**cc.dict())
    db.add(db_cc)
    db.commit()
    db.refresh(db_cc)
    return db_cc

def get_climate_conditions(db: Session, skip: int = 0, limit: int = 100) -> List[ClimateCondition]:
    return db.query(ClimateCondition).offset(skip).limit(limit).all()
