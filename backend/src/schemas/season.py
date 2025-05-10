"""
Schemas para estações do ano.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.season import SeasonType

class SeasonBase(BaseModel):
    """Schema base para estações do ano."""
    name: SeasonType
    description: Optional[str] = None
    soil_moisture_factor: float = 1.0
    organic_matter_factor: float = 1.0
    biodiversity_factor: float = 1.0
    fertility_factor: float = 1.0
    germination_factor: float = 1.0
    maturation_factor: float = 1.0

class SeasonCreate(SeasonBase):
    """Schema para criar uma nova estação."""
    pass

class SeasonUpdate(BaseModel):
    """Schema para atualizar uma estação."""
    description: Optional[str] = None
    soil_moisture_factor: Optional[float] = None
    organic_matter_factor: Optional[float] = None
    biodiversity_factor: Optional[float] = None
    fertility_factor: Optional[float] = None
    germination_factor: Optional[float] = None
    maturation_factor: Optional[float] = None

class SeasonOut(SeasonBase):
    """Schema para retornar dados de uma estação."""
    id: int
    start_date: datetime

    class Config:
        orm_mode = True
