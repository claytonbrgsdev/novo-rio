from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None

class BadgeCreate(BadgeBase):
    player_id: int

class BadgeOut(BadgeBase):
    id: int
    player_id: int
    awarded_at: datetime

    class Config:
        orm_mode = True
