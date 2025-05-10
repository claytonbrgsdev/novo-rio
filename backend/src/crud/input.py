from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.input import Input
from ..models.planting import Planting
from ..schemas.input import InputCreate, InputUpdate
from ..services.input_effects import apply_input_effects


def create_input(db: Session, input_in: InputCreate) -> Input:
    """
    Create a new input/resource applied to a planting.
    Validates that the planting exists before creating the input.
    """
    # Validate that the planting exists
    planting = db.query(Planting).filter(Planting.id == input_in.planting_id).first()
    if not planting:
        raise ValueError(f"Planting with id {input_in.planting_id} not found")
    
    # Create the input
    db_input = Input(
        planting_id=input_in.planting_id,
        type=input_in.type,
        quantity=input_in.quantity
    )
    
    db.add(db_input)
    db.commit()
    db.refresh(db_input)
    
    # Aplicar efeitos do insumo no solo e planta
    applied_effects = apply_input_effects(db, db_input)
    
    return db_input


def get_input(db: Session, input_id: int) -> Optional[Input]:
    """Get a single input by its ID."""
    return db.query(Input).filter(Input.id == input_id).first()


def get_inputs(db: Session, planting_id: int, skip: int = 0, limit: int = 100) -> List[Input]:
    """Get all inputs for a specific planting."""
    return db.query(Input)\
            .filter(Input.planting_id == planting_id)\
            .order_by(Input.applied_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()


def get_all_inputs(db: Session, skip: int = 0, limit: int = 100) -> List[Input]:
    """Get all inputs across all plantings."""
    return db.query(Input).order_by(Input.applied_at.desc()).offset(skip).limit(limit).all()


def delete_input(db: Session, input_id: int) -> bool:
    """Delete an input by its ID."""
    db_input = db.query(Input).filter(Input.id == input_id).first()
    if not db_input:
        return False
    
    db.delete(db_input)
    db.commit()
    
    return True
