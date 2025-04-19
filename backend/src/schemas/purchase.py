from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PurchaseBase(BaseModel):
    player_id: int
    shop_item_id: int
    quantity: int = 1

class PurchaseCreate(PurchaseBase):
    pass

class PurchaseOut(PurchaseBase):
    id: int
    total_price: float
    created_at: datetime

    class Config:
        orm_mode = True
