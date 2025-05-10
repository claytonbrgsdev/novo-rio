from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.terrain import Terrain
from ..schemas.terrain import TerrainCreate, TerrainUpdate
from ..crud_async.quadrant import generate_quadrants_for_terrain_async

async def create_terrain_async(db: AsyncSession, terrain_in: TerrainCreate) -> Terrain:
    db_terrain = Terrain(**terrain_in.dict())
    db.add(db_terrain)
    await db.commit()
    await db.refresh(db_terrain)
    
    # Auto-generate 15 quadrants (5x3 grid) for this terrain
    await generate_quadrants_for_terrain_async(db, db_terrain.id)
    
    return db_terrain

async def get_terrain_async(db: AsyncSession, terrain_id: int) -> Optional[Terrain]:
    result = await db.execute(select(Terrain).where(Terrain.id == terrain_id))
    return result.scalars().first()

async def get_terrains_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Terrain]:
    result = await db.execute(select(Terrain).offset(skip).limit(limit))
    return result.scalars().all()

async def update_terrain_async(db: AsyncSession, terrain_id: int, terrain_in: TerrainUpdate) -> Optional[Terrain]:
    terrain = await get_terrain_async(db, terrain_id)
    if terrain:
        for field, value in terrain_in.dict(exclude_unset=True).items():
            setattr(terrain, field, value)
        await db.commit()
        await db.refresh(terrain)
    return terrain

async def delete_terrain_async(db: AsyncSession, terrain_id: int) -> None:
    terrain = await get_terrain_async(db, terrain_id)
    if terrain:
        await db.delete(terrain)
        await db.commit()
