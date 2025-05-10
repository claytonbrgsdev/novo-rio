from pydantic import BaseModel
from typing import Optional

class QuadrantBase(BaseModel):
    terrain_id: int
    label: str

class QuadrantCreate(QuadrantBase):
    """Schema for creating a Quadrant"""
    pass

class QuadrantUpdate(BaseModel):
    """Schema for updating a Quadrant"""
    label: Optional[str] = None
    soil_moisture: Optional[float] = None
    fertility: Optional[int] = None
    coverage: Optional[float] = None
    organic_matter: Optional[int] = None
    compaction: Optional[int] = None
    biodiversity: Optional[int] = None

class QuadrantOut(QuadrantBase):
    """Schema for returning a Quadrant"""
    id: int
    soil_moisture: float
    fertility: int
    coverage: float
    organic_matter: int
    compaction: int
    biodiversity: int

    class Config:
        orm_mode = True
