from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    player_id: int

class ItemOut(ItemBase):
    id: int
    player_id: int
    created_at: datetime

    class Config:
        orm_mode = True
