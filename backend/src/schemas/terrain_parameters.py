from pydantic import BaseModel
from typing import Optional

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
