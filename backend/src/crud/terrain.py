from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from ..models.terrain import Terrain
from ..schemas.terrain import TerrainCreate, TerrainUpdate
from ..crud.quadrant import generate_quadrants_for_terrain


# Versão síncrona para endpoints síncronos
def create_terrain(db: Session, terrain: TerrainCreate) -> Terrain:
    db_obj = Terrain(**terrain.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Auto-generate 15 quadrants (5x3 grid) for this terrain
    generate_quadrants_for_terrain(db, db_obj.id)
    
    return db_obj


# Versão assíncrona para endpoints assíncronos
async def create_terrain_async(db: AsyncSession, terrain: TerrainCreate) -> Terrain:
    db_obj = Terrain(**terrain.dict())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


def get_terrain(db: Session, terrain_id: int) -> Optional[Terrain]:
    return db.query(Terrain).filter(Terrain.id == terrain_id).first()


# Versão síncrona para endpoints síncronos
def get_terrains(db: Session, skip: int = 0, limit: int = 100) -> List[Terrain]:
    return db.query(Terrain).offset(skip).limit(limit).all()


# Versão assíncrona para endpoints assíncronos
async def get_terrains_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Terrain]:
    result = await db.execute(select(Terrain).offset(skip).limit(limit))
    return result.scalars().all()


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
