from sqlalchemy.orm import Session
from typing import Optional

from ..models.terrain_parameters import TerrainParameters
from ..schemas.terrain_parameters import TerrainParametersCreate, TerrainParametersUpdate


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
