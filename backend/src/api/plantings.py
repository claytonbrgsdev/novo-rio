from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..db import get_db, SessionLocal
from ..models.planting import Planting
from ..schemas.planting import PlantingSchema, PlantingCreate, PlantingUpdate
from ..crud.planting import create_planting, get_planting, get_plantings_by_player, get_plantings_by_quadrant, update_planting, delete_planting

router = APIRouter(prefix="/plantings", tags=["plantings"])

@router.get("/", response_model=List[PlantingSchema], summary="List Plantings")
async def list_plantings(
    player_id: Optional[int] = None, 
    quadrant_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    """List plantings with optional filters for player or quadrant"""
    try:
        query = db.query(Planting)
        
        if player_id is not None and quadrant_id is not None:
            # Filter by both player and quadrant
            query = query.filter(
                Planting.player_id == player_id,
                Planting.quadrant_id == quadrant_id
            )
        elif player_id is not None:
            # Filter by player only
            query = query.filter(Planting.player_id == player_id)
        elif quadrant_id is not None:
            # Filter by quadrant only
            query = query.filter(Planting.quadrant_id == quadrant_id)
            
        # Execute query and return results
        return query.all()
    except Exception as e:
        print(f"Error fetching plantings: {str(e)}")
        # Return empty list instead of 500 error
        return []

@router.get("/{planting_id}", response_model=PlantingSchema, summary="Get Planting")
async def get_planting_endpoint(planting_id: int, db: Session = Depends(get_db)):
    """Get a planting by ID"""
    try:
        planting = get_planting(db, planting_id)
        if not planting:
            raise HTTPException(status_code=404, detail="Planting not found")
        return planting
    except HTTPException as e:
        # Re-raise HTTP exceptions (like 404)
        raise e
    except Exception as e:
        print(f"Error fetching planting: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/", response_model=PlantingSchema, summary="Create Planting",
             description="Create a new planting in a specific slot within a quadrant.\n\nExample request:\n```json\n{ \"player_id\": 1, \"quadrant_id\": 3, \"slot_index\": 5, \"species_id\": 2 }\n```")
async def create_planting_endpoint(planting: PlantingCreate, db: Session = Depends(get_db)):
    """Create a new planting in a specific slot"""
    try:
        return create_planting(db, planting)
    except IntegrityError:
        print(f"Integrity error when creating planting: slot already occupied or invalid references")
        raise HTTPException(
            status_code=400,
            detail="Slot already occupied or invalid references"
        )
    except Exception as e:
        print(f"Error creating planting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create planting: {str(e)}")

@router.put("/{planting_id}", response_model=PlantingSchema, summary="Update Planting")
async def update_planting_endpoint(planting_id: int, planting_data: PlantingUpdate, db: Session = Depends(get_db)):
    """Update an existing planting"""
    try:
        planting = update_planting(db, planting_id, planting_data)
        if not planting:
            raise HTTPException(status_code=404, detail="Planting not found")
        return planting
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        print(f"Error updating planting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update planting: {str(e)}")

@router.delete("/{planting_id}", response_model=dict, summary="Delete Planting")
async def delete_planting_endpoint(planting_id: int, db: Session = Depends(get_db)):
    """Delete a planting"""
    try:
        success = delete_planting(db, planting_id)
        if not success:
            raise HTTPException(status_code=404, detail="Planting not found")
        return {"status": "success", "message": f"Planting {planting_id} deleted"}
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        print(f"Error deleting planting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete planting: {str(e)}")
