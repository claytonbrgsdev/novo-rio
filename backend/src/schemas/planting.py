from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class PlantingBase(BaseModel):
    """Base schema for plantings"""
    species_id: int
    player_id: int
    quadrant_id: int
    slot_index: int

class PlantingCreate(PlantingBase):
    """Schema for creating plantings"""
    pass

class PlantingUpdate(BaseModel):
    """Schema for updating plantings"""
    species_id: Optional[int] = None
    current_state: Optional[str] = None
    days_since_planting: Optional[int] = None
    days_sem_rega: Optional[int] = None

class PlantingSchema(PlantingBase):
    """Schema for returning plantings"""
    id: int
    planted_at: datetime
    current_state: str
    days_since_planting: int
    days_sem_rega: int

    class Config:
        orm_mode = True
