from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClimateConditionBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClimateConditionCreate(ClimateConditionBase):
    pass

class ClimateConditionOut(ClimateConditionBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
