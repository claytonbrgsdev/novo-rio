from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.terrain import Terrain
from ..schemas.terrain import TerrainCreate, TerrainUpdate


def create_terrain(db: Session, terrain: TerrainCreate) -> Terrain:
    db_obj = Terrain(**terrain.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_terrain(db: Session, terrain_id: int) -> Optional[Terrain]:
    return db.query(Terrain).filter(Terrain.id == terrain_id).first()


def get_terrains(db: Session, skip: int = 0, limit: int = 100) -> List[Terrain]:
    return db.query(Terrain).offset(skip).limit(limit).all()


def update_terrain_crud(db: Session, terrain_id: int, terrain_update: TerrainUpdate) -> Optional[Terrain]:
    db_obj = get_terrain(db, terrain_id)
    if db_obj:
        for field, value in terrain_update.dict(exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj


def delete_terrain(db: Session, terrain_id: int) -> None:
    db_obj = get_terrain(db, terrain_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
