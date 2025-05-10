from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud.quadrant import get_quadrant, get_quadrants, update_quadrant, delete_quadrant
from ..schemas.quadrant import QuadrantOut, QuadrantUpdate

router = APIRouter(prefix="/quadrants", tags=["quadrants"])

@router.get("/", response_model=List[QuadrantOut],
            summary="List Quadrants",
            description="Retrieves a list of quadrants for a specific terrain with pagination.")
async def list_quadrants(
    terrain_id: int = Query(..., description="ID of the terrain to get quadrants for"),
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Returns a list of quadrants for a terrain."""
    return await run_in_threadpool(get_quadrants, db, terrain_id, skip, limit)

@router.get("/{quadrant_id}", response_model=QuadrantOut,
            summary="Get Quadrant",
            description="Retrieves a quadrant by its ID.")
async def get_quadrant_endpoint(quadrant_id: int, db: Session = Depends(get_db)):
    """Fetches a quadrant by ID."""
    db_quadrant = await run_in_threadpool(get_quadrant, db, quadrant_id)
    if not db_quadrant:
        raise HTTPException(status_code=404, detail="Quadrant not found")
    return db_quadrant

@router.put("/{quadrant_id}", response_model=QuadrantOut,
            summary="Update Quadrant",
            description="Updates quadrant fields.")
async def update_quadrant_endpoint(
    quadrant_id: int, 
    quadrant_update: QuadrantUpdate, 
    db: Session = Depends(get_db)
):
    """Updates an existing quadrant."""
    db_quadrant = await run_in_threadpool(update_quadrant, db, quadrant_id, quadrant_update)
    if not db_quadrant:
        raise HTTPException(status_code=404, detail="Quadrant not found")
    return db_quadrant

@router.delete("/{quadrant_id}", status_code=204,
               summary="Delete Quadrant",
               description="Deletes a quadrant by its ID.")
async def delete_quadrant_endpoint(quadrant_id: int, db: Session = Depends(get_db)):
    """Deletes a quadrant record."""
    await run_in_threadpool(delete_quadrant, db, quadrant_id)
    return None
