from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db, get_async_db
from ..crud.quadrant import get_quadrant, get_quadrants, update_quadrant, delete_quadrant
from ..schemas.quadrant import QuadrantOut, QuadrantUpdate
from ..models.quadrant import Quadrant

router = APIRouter(prefix="/quadrants", tags=["quadrants"])

@router.get("/", response_model=List[QuadrantOut],
            summary="List Quadrants",
            description="Retrieves a list of quadrants with pagination. Filter by terrain_id if provided.")
async def list_quadrants(
    terrain_id: Optional[int] = Query(None, description="Optional: ID of the terrain to filter quadrants"),
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_async_db)
):
    """Returns a list of quadrants, optionally filtered by terrain_id."""
    try:
        # Criar a consulta SQL de forma adequada para o contexto assíncrono
        query = Quadrant.__table__.select().offset(skip).limit(limit)
        
        # Aplicar filtro apenas se terrain_id for fornecido
        if terrain_id is not None:
            query = query.where(Quadrant.__table__.c.terrain_id == terrain_id)
            
        result = await db.execute(query)
        quadrants = result.fetchall()
        return [QuadrantOut.from_orm(q) for q in quadrants]
    except Exception as e:
        print(f"Error fetching quadrants: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch quadrants: {str(e)}"
        )

@router.get("/{quadrant_id}", response_model=QuadrantOut,
            summary="Get Quadrant",
            description="Retrieves a quadrant by its ID.")
async def get_quadrant_endpoint(quadrant_id: int, db: AsyncSession = Depends(get_async_db)):
    """Fetches a quadrant by ID."""
    try:
        query = Quadrant.__table__.select().where(Quadrant.__table__.c.id == quadrant_id)
        result = await db.execute(query)
        db_quadrant = result.fetchone()
        
        if not db_quadrant:
            raise HTTPException(status_code=404, detail="Quadrant not found")
        return QuadrantOut.from_orm(db_quadrant)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching quadrant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch quadrant: {str(e)}")

@router.put("/{quadrant_id}", response_model=QuadrantOut,
            summary="Update Quadrant",
            description="Updates quadrant fields.")
async def update_quadrant_endpoint(
    quadrant_id: int, 
    quadrant_update: QuadrantUpdate, 
    db: Session = Depends(get_db)
):
    """Updates an existing quadrant."""
    try:
        db_quadrant = update_quadrant(db, quadrant_id, quadrant_update)
        if not db_quadrant:
            raise HTTPException(status_code=404, detail="Quadrant not found")
        return db_quadrant
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating quadrant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update quadrant: {str(e)}")

@router.delete("/{quadrant_id}", status_code=204,
               summary="Delete Quadrant",
               description="Deletes a quadrant by its ID.")
async def delete_quadrant_endpoint(quadrant_id: int, db: Session = Depends(get_db)):
    """Deletes a quadrant record."""
    try:
        success = delete_quadrant(db, quadrant_id)
        if not success:
            raise HTTPException(status_code=404, detail="Quadrant not found")
        return None
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error deleting quadrant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete quadrant: {str(e)}")
