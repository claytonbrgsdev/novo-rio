from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.quadrant import (
    get_quadrant_async,
    get_quadrants_async,
    update_quadrant_async,
    delete_quadrant_async,
)
from ..schemas.quadrant import QuadrantOut, QuadrantUpdate

router = APIRouter(prefix="/async/quadrants", tags=["quadrants"])

@router.get("/", response_model=List[QuadrantOut])
async def list_quadrants_async(
    terrain_id: int = Query(..., description="ID of the terrain to get quadrants for"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db()),
):
    """Returns a list of quadrants for a terrain."""
    return await get_quadrants_async(db, terrain_id, skip, limit)

@router.get("/{quadrant_id}", response_model=QuadrantOut)
async def get_quadrant_async_endpoint(
    quadrant_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Fetches a quadrant by ID."""
    quadrant = await get_quadrant_async(db, quadrant_id)
    if not quadrant:
        raise HTTPException(status_code=404, detail="Quadrant not found")
    return quadrant

@router.put("/{quadrant_id}", response_model=QuadrantOut)
async def update_quadrant_async_endpoint(
    quadrant_id: int,
    quadrant_update: QuadrantUpdate,
    db: AsyncSession = Depends(get_async_db()),
):
    """Updates an existing quadrant."""
    quadrant = await update_quadrant_async(db, quadrant_id, quadrant_update)
    if not quadrant:
        raise HTTPException(status_code=404, detail="Quadrant not found")
    return quadrant

@router.delete("/{quadrant_id}", status_code=204)
async def delete_quadrant_async_endpoint(
    quadrant_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Deletes a quadrant record."""
    await delete_quadrant_async(db, quadrant_id)
    return None
