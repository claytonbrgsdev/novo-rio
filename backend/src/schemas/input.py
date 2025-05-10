from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


class InputBase(BaseModel):
    """Base schema for agricultural inputs/resources."""
    type: str  # água, fertilizante, composto, etc.
    quantity: float


class InputCreate(InputBase):
    """Schema for creating a new input/resource."""
    planting_id: int


class InputUpdate(BaseModel):
    """Schema for updating an existing input/resource."""
    type: Optional[str] = None
    quantity: Optional[float] = None


class InputOut(InputBase):
    """Schema for returning input/resource data."""
    id: int
    planting_id: int
    applied_at: datetime

    class Config:
        orm_mode = True


class ParameterEffect(BaseModel):
    """Schema for representing the effect on a parameter."""
    parameter: str = Field(..., description="Nome do parâmetro afetado")
    before: float = Field(..., description="Valor antes da aplicação do insumo")
    after: float = Field(..., description="Valor após a aplicação do insumo")
    change: float = Field(..., description="Diferença entre os valores antes e depois")
    

class InputWithEffectsOut(InputOut):
    """Schema for returning input/resource data with its effects on soil parameters."""
    effects: List[ParameterEffect] = Field(
        [], 
        description="Efeitos do insumo nos parâmetros do solo e da planta"
    )
    terrain_id: Optional[int] = Field(None, description="ID do terreno onde o insumo foi aplicado")
    quadrant_id: Optional[int] = Field(None, description="ID do quadrante onde o insumo foi aplicado")
    plant_effects: Optional[Dict[str, Any]] = Field(
        None, 
        description="Efeitos do insumo na planta (por exemplo, days_sem_rega)"
    )
