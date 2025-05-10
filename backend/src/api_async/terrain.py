from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.terrain import (
    create_terrain_async,
    get_terrains_async,
    get_terrain_async,
    update_terrain_async,
    delete_terrain_async,
)
from ..schemas.terrain import TerrainCreate, TerrainUpdate, TerrainOut

router = APIRouter(prefix="/async/terrains", tags=["terrains"])

@router.post("/", response_model=TerrainOut)
async def create_terrain_async_endpoint(
    terrain: TerrainCreate, db: AsyncSession = Depends(get_async_db())
):
    return await create_terrain_async(db, terrain)

@router.get("/", response_model=List[TerrainOut])
async def list_terrains_async(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db())
):
    return await get_terrains_async(db, skip, limit)

@router.get("/{terrain_id}", response_model=TerrainOut)
async def get_terrain_async_endpoint(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    terrain = await get_terrain_async(db, terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return terrain

@router.put("/{terrain_id}", response_model=TerrainOut)
async def update_terrain_async_endpoint(
    terrain_id: int,
    terrain_update: TerrainUpdate,
    db: AsyncSession = Depends(get_async_db()),
):
    terrain = await update_terrain_async(db, terrain_id, terrain_update)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return terrain

@router.delete("/{terrain_id}", status_code=204)
async def delete_terrain_async_endpoint(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    await delete_terrain_async(db, terrain_id)
    return None
