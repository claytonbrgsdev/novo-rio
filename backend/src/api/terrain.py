from typing import List
from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud.terrain import create_terrain, get_terrain, get_terrains, update_terrain_crud, delete_terrain
from ..schemas.terrain import TerrainCreate, TerrainUpdate, TerrainOut

router = APIRouter(prefix="/terrains", tags=["terrains"])

@router.post("/", response_model=TerrainOut,
             summary="Create Terrain",
             description="Creates a new terrain for a player.\n\nExample request:\n```json\n{ \"player_id\": 1, \"name\": \"Forest\", \"x_coordinate\": 1.0, \"y_coordinate\": 2.0, \"access_type\": \"pub\" }\n```")
async def create_terrain_endpoint(terrain: TerrainCreate, db: Session = Depends(get_db)):
    """Creates a new terrain record."""
    return await run_in_threadpool(create_terrain, db, terrain)

@router.get("/", response_model=List[TerrainOut],
            summary="List Terrains",
            description="Retrieves a list of terrains with pagination.")
async def list_terrains(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns a list of terrains."""
    return await run_in_threadpool(get_terrains, db, skip, limit)

@router.get("/{terrain_id}", response_model=TerrainOut,
            summary="Get Terrain",
            description="Retrieves a terrain by its ID.")
async def get_terrain_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    """Fetches a terrain by ID."""
    db_terrain = await run_in_threadpool(get_terrain, db, terrain_id)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return db_terrain

@router.put("/{terrain_id}", response_model=TerrainOut,
            summary="Update Terrain",
            description="Updates terrain fields.\n\nExample request:\n```json\n{ \"name\": \"NewForest\" }\n```")
async def update_terrain_endpoint(terrain_id: int, terrain_update: TerrainUpdate, db: Session = Depends(get_db)):
    """Updates an existing terrain."""
    db_terrain = await run_in_threadpool(update_terrain_crud, db, terrain_id, terrain_update)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return db_terrain

@router.delete("/{terrain_id}", status_code=204,
               summary="Delete Terrain",
               description="Deletes a terrain by its ID.")
async def delete_terrain_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    """Deletes a terrain record."""
    await run_in_threadpool(delete_terrain, db, terrain_id)
    return None
