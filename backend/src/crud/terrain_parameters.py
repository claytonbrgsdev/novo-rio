from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ..models.terrain_parameters import TerrainParameters
from ..schemas.terrain_parameters import TerrainParametersCreate, TerrainParametersUpdate
from ..services.soil_health import analyze_soil_health


def get_terrain_parameters(db: Session, terrain_id: int) -> Optional[TerrainParameters]:
    return db.query(TerrainParameters).filter(TerrainParameters.terrain_id == terrain_id).first()


def create_terrain_parameters(db: Session, params: TerrainParametersCreate) -> TerrainParameters:
    db_params = TerrainParameters(**params.dict())
    db.add(db_params)
    db.commit()
    db.refresh(db_params)
    return db_params


def update_terrain_parameters(db: Session, terrain_id: int, params_update: TerrainParametersUpdate) -> Optional[TerrainParameters]:
    db_params = get_terrain_parameters(db, terrain_id)
    if db_params:
        for field, value in params_update.dict(exclude_unset=True).items():
            setattr(db_params, field, value)
        db.commit()
        db.refresh(db_params)
    return db_params


def get_terrain_health_report(db: Session, terrain_id: int) -> Dict[str, Any]:
    """
    Gera um relatório de saúde do solo para um terreno.
    
    Args:
        db (Session): Sessão do banco de dados
        terrain_id (int): ID do terreno
        
    Returns:
        Dict[str, Any]: Relatório com índice de saúde, categoria e alertas
    """
    # Obter os parâmetros do terreno
    terrain_params = get_terrain_parameters(db, terrain_id)
    if not terrain_params:
        return {
            "health_index": 0,
            "health_category": "Desconhecido",
            "alerts": [],
            "recommendations": ["Parâmetros do terreno não encontrados"]
        }
    
    # Analisar a saúde do solo
    return analyze_soil_health(terrain_params)
