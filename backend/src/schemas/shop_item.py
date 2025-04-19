from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ShopItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ShopItemCreate(ShopItemBase):
    pass

class ShopItemOut(ShopItemBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
