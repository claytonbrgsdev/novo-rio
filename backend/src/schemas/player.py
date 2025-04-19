from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlayerBase(BaseModel):
    name: str
    balance: float = 0.0

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None

class PlayerOut(PlayerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    balance: float

    class Config:
        orm_mode = True
