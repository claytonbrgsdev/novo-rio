from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActionBase(BaseModel):
    player_id: int
    terrain_id: int
    action_name: str
    sub_action: Optional[str] = None
    details: Optional[str] = None

class ActionCreate(ActionBase):
    pass

class ActionOut(ActionBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
