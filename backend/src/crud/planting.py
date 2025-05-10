from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..models.planting import Planting
from ..schemas.planting import PlantingCreate, PlantingUpdate


def create_planting(db: Session, planting: PlantingCreate) -> Planting:
    """
    Create a new planting.
    Validates that there is no other planting with the same quadrant_id and slot_index.
    """
    # Check if the slot is already occupied
    existing = db.query(Planting).filter(
        Planting.quadrant_id == planting.quadrant_id,
        Planting.slot_index == planting.slot_index
    ).first()
    
    if existing:
        raise ValueError(f"Slot {planting.slot_index} in quadrant {planting.quadrant_id} is already occupied")
    
    # Create the planting
    db_obj = Planting(**planting.dict())
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Unable to create planting in slot {planting.slot_index} of quadrant {planting.quadrant_id}. The slot may be occupied.")


def get_planting(db: Session, planting_id: int) -> Optional[Planting]:
    """Get a planting by ID."""
    return db.query(Planting).filter(Planting.id == planting_id).first()


def get_plantings_by_player(db: Session, player_id: int, skip: int = 0, limit: int = 100) -> List[Planting]:
    """Get all plantings for a player."""
    return db.query(Planting).filter(Planting.player_id == player_id).offset(skip).limit(limit).all()


def get_plantings_by_quadrant(db: Session, quadrant_id: int, skip: int = 0, limit: int = 100) -> List[Planting]:
    """Get all plantings in a quadrant."""
    return db.query(Planting).filter(Planting.quadrant_id == quadrant_id).offset(skip).limit(limit).all()


def update_planting(db: Session, planting_id: int, planting_data: PlantingUpdate) -> Optional[Planting]:
    """Update a planting."""
    db_obj = get_planting(db, planting_id)
    if db_obj:
        for field, value in planting_data.dict(exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj


def delete_planting(db: Session, planting_id: int) -> None:
    """Delete a planting."""
    db_obj = get_planting(db, planting_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()


def is_slot_available(db: Session, quadrant_id: int, slot_index: int) -> bool:
    """
    Check if a slot is available in a quadrant.
    Returns True if the slot is available, False otherwise.
    """
    existing = db.query(Planting).filter(
        Planting.quadrant_id == quadrant_id,
        Planting.slot_index == slot_index
    ).first()
    
    return existing is None
