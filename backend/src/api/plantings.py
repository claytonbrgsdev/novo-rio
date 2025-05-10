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
def list_plantings(
    player_id: Optional[int] = None, 
    quadrant_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    """List plantings with optional filters for player or quadrant"""
    if player_id is not None and quadrant_id is not None:
        # Filter by both player and quadrant
        return db.query(Planting).filter(
            Planting.player_id == player_id,
            Planting.quadrant_id == quadrant_id
        ).all()
    elif player_id is not None:
        # Filter by player only
        return get_plantings_by_player(db, player_id)
    elif quadrant_id is not None:
        # Filter by quadrant only
        return get_plantings_by_quadrant(db, quadrant_id)
    else:
        # No filters, return all
        return db.query(Planting).all()

@router.get("/{planting_id}", response_model=PlantingSchema, summary="Get Planting")
def get_planting_endpoint(planting_id: int, db: Session = Depends(get_db)):
    """Get a planting by ID"""
    planting = get_planting(db, planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    return planting

@router.post("/", response_model=PlantingSchema, summary="Create Planting",
             description="Create a new planting in a specific slot within a quadrant.\n\nExample request:\n```json\n{ \"player_id\": 1, \"quadrant_id\": 3, \"slot_index\": 5, \"species_id\": 2 }\n```")
def create_planting_endpoint(planting: PlantingCreate, db: Session = Depends(get_db)):
    """Create a new planting in a specific slot within a quadrant"""
    try:
        return create_planting(db, planting)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(
            status_code=400, 
            detail=f"Slot {planting.slot_index} in quadrant {planting.quadrant_id} is already occupied"
        )

@router.put("/{planting_id}", response_model=PlantingSchema, summary="Update Planting")
def update_planting_endpoint(planting_id: int, planting_data: PlantingUpdate, db: Session = Depends(get_db)):
    """Update an existing planting"""
    updated_planting = update_planting(db, planting_id, planting_data)
    if not updated_planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    return updated_planting

@router.delete("/{planting_id}", status_code=204, summary="Delete Planting")
def delete_planting_endpoint(planting_id: int, db: Session = Depends(get_db)):
    """Delete a planting"""
    planting = get_planting(db, planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    delete_planting(db, planting_id)
    return None
