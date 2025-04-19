from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TerrainBase(BaseModel):
    player_id: int
    name: Optional[str] = None
    x_coordinate: Optional[float] = None
    y_coordinate: Optional[float] = None
    access_type: Optional[str] = None

class TerrainCreate(TerrainBase):
    pass

class TerrainUpdate(BaseModel):
    name: Optional[str] = None
    x_coordinate: Optional[float] = None
    y_coordinate: Optional[float] = None
    access_type: Optional[str] = None

class TerrainOut(TerrainBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
