from pydantic import BaseModel
from typing import Optional, List, Dict, Union

from .soil_health import SoilHealthReport

class TerrainParametersBase(BaseModel):
    terrain_id: int
    coverage: Optional[float] = 0.0
    regeneration_cycles: Optional[int] = 0

class TerrainParametersCreate(TerrainParametersBase):
    """Schema para criar TerrainParameters"""
    pass

class TerrainParametersUpdate(BaseModel):
    """Schema para atualizar TerrainParameters"""
    coverage: Optional[float] = None
    regeneration_cycles: Optional[int] = None
    soil_moisture: Optional[float] = None
    fertility: Optional[int] = None
    soil_ph: Optional[float] = None
    organic_matter: Optional[int] = None
    compaction: Optional[int] = None
    biodiversity: Optional[int] = None
    spontaneous_species_count: Optional[int] = None

class TerrainParametersOut(TerrainParametersBase):
    """Schema para retornar TerrainParameters"""
    id: int
    soil_moisture: float = 0.0
    fertility: int = 0
    soil_ph: float = 7.0
    organic_matter: int = 0
    compaction: int = 0
    biodiversity: int = 0
    spontaneous_species_count: int = 0
    
    class Config:
        orm_mode = True

class TerrainParametersWithHealthOut(TerrainParametersOut):
    """Schema para retornar TerrainParameters com relatório de saúde do solo"""
    health_report: SoilHealthReport
