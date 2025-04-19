from typing import List
from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.terrain import create_terrain, get_terrain, get_terrains, update_terrain_crud, delete_terrain
from ..schemas.terrain import TerrainCreate, TerrainUpdate, TerrainOut

router = APIRouter(prefix="/terrains", tags=["terrains"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=TerrainOut)
async def create_terrain_endpoint(terrain: TerrainCreate, db: Session = Depends(get_db)):
    return await run_in_threadpool(create_terrain, db, terrain)

@router.get("/", response_model=List[TerrainOut])
async def list_terrains(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_threadpool(get_terrains, db, skip, limit)

@router.get("/{terrain_id}", response_model=TerrainOut)
async def get_terrain_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    db_terrain = await run_in_threadpool(get_terrain, db, terrain_id)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return db_terrain

@router.put("/{terrain_id}", response_model=TerrainOut)
async def update_terrain_endpoint(terrain_id: int, terrain_update: TerrainUpdate, db: Session = Depends(get_db)):
    db_terrain = await run_in_threadpool(update_terrain_crud, db, terrain_id, terrain_update)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return db_terrain

@router.delete("/{terrain_id}", status_code=204)
async def delete_terrain_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    await run_in_threadpool(delete_terrain, db, terrain_id)
    return None
