from typing import Optional
from pydantic import BaseModel

class SpeciesBase(BaseModel):
    common_name: str
    germinacao_dias: int
    maturidade_dias: int
    agua_diaria_min: float
    espaco_m2: float
    rendimento_unid: int
    tolerancia_seca: str
    germinacao_dias_scaled: Optional[float] = None
    maturidade_dias_scaled: Optional[float] = None

class SpeciesCreate(SpeciesBase):
    pass

class SpeciesUpdate(SpeciesBase):
    common_name: Optional[str] = None
    germinacao_dias: Optional[int] = None
    maturidade_dias: Optional[int] = None
    agua_diaria_min: Optional[float] = None
    espaco_m2: Optional[float] = None
    rendimento_unid: Optional[int] = None
    tolerancia_seca: Optional[str] = None

class SpeciesSchema(SpeciesBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
