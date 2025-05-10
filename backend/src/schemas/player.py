from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlayerBase(BaseModel):
    name: str
    balance: float = 0.0
    aura: float = 100.0

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    aura: Optional[float] = None

class PlayerOut(PlayerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    balance: float
    aura: float

    class Config:
        orm_mode = True
