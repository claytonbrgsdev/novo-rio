from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.quadrant import Quadrant
from ..schemas.quadrant import QuadrantCreate, QuadrantUpdate


def create_quadrant(db: Session, quadrant: QuadrantCreate) -> Quadrant:
    """Create a new quadrant."""
    db_obj = Quadrant(**quadrant.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_quadrant(db: Session, quadrant_id: int) -> Optional[Quadrant]:
    """Get a quadrant by ID."""
    return db.query(Quadrant).filter(Quadrant.id == quadrant_id).first()


def get_quadrants(db: Session, terrain_id: int, skip: int = 0, limit: int = 100) -> List[Quadrant]:
    """Get all quadrants for a terrain."""
    return db.query(Quadrant).filter(Quadrant.terrain_id == terrain_id).offset(skip).limit(limit).all()


def update_quadrant(db: Session, quadrant_id: int, quadrant_update: QuadrantUpdate) -> Optional[Quadrant]:
    """Update a quadrant."""
    db_obj = get_quadrant(db, quadrant_id)
    if db_obj:
        for field, value in quadrant_update.dict(exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj


def delete_quadrant(db: Session, quadrant_id: int) -> None:
    """Delete a quadrant."""
    db_obj = get_quadrant(db, quadrant_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()


def generate_quadrants_for_terrain(db: Session, terrain_id: int) -> List[Quadrant]:
    """Generate the 15 quadrants (5x3 grid) for a terrain."""
    ROWS = ["A", "B", "C"]
    COLS = ["1", "2", "3", "4", "5"]
    quadrants = []
    
    for r in ROWS:
        for c in COLS:
            label = f"{r}{c}"
            quadrant = QuadrantCreate(terrain_id=terrain_id, label=label)
            db_obj = create_quadrant(db, quadrant)
            quadrants.append(db_obj)
    
    return quadrants
