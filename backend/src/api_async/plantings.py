from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from ..db import get_async_db
from ..models.planting import Planting
from ..schemas.planting import PlantingSchema, PlantingCreate, PlantingUpdate
from ..crud_async.planting import (
    create_planting_async,
    get_planting_async,
    get_plantings_by_player_async,
    get_plantings_by_quadrant_async,
    update_planting_async,
    delete_planting_async
)

router = APIRouter(prefix="/async/plantings", tags=["plantings"])

@router.get("/", response_model=List[PlantingSchema])
async def list_plantings_async(
    player_id: Optional[int] = None,
    quadrant_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_db())
):
    """List plantings with optional filters for player or quadrant (async)"""
    if player_id is not None and quadrant_id is not None:
        # Filter by both player and quadrant
        result = await db.execute(
            db.query(Planting).filter(
                Planting.player_id == player_id,
                Planting.quadrant_id == quadrant_id
            )
        )
        return result.scalars().all()
    elif player_id is not None:
        # Filter by player only
        return await get_plantings_by_player_async(db, player_id)
    elif quadrant_id is not None:
        # Filter by quadrant only
        return await get_plantings_by_quadrant_async(db, quadrant_id)
    else:
        # No filters, return all
        result = await db.execute(db.query(Planting))
        return result.scalars().all()

@router.get("/{planting_id}", response_model=PlantingSchema)
async def get_planting_async_endpoint(
    planting_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Get a planting by ID (async)"""
    planting = await get_planting_async(db, planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    return planting

@router.post("/", response_model=PlantingSchema)
async def create_planting_async_endpoint(
    planting: PlantingCreate, db: AsyncSession = Depends(get_async_db())
):
    """Create a new planting in a specific slot within a quadrant (async)"""
    try:
        return await create_planting_async(db, planting)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail=f"Slot {planting.slot_index} in quadrant {planting.quadrant_id} is already occupied"
        )

@router.put("/{planting_id}", response_model=PlantingSchema)
async def update_planting_async_endpoint(
    planting_id: int,
    planting_data: PlantingUpdate,
    db: AsyncSession = Depends(get_async_db())
):
    """Update an existing planting (async)"""
    updated_planting = await update_planting_async(db, planting_id, planting_data)
    if not updated_planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    return updated_planting

@router.delete("/{planting_id}", status_code=204)
async def delete_planting_async_endpoint(
    planting_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Delete a planting (async)"""
    planting = await get_planting_async(db, planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    await delete_planting_async(db, planting_id)
    return None
