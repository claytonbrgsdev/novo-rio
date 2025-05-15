from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.player_progress import PlayerProgress
from ..schemas.player_progress import PlayerProgressCreate, PlayerProgressUpdate


def get_player_progress(db: Session, progress_id: int) -> Optional[PlayerProgress]:
    """Get player progress by ID."""
    return db.query(PlayerProgress).filter(PlayerProgress.id == progress_id).first()


def get_player_progress_by_user_id(db: Session, user_id: str) -> Optional[PlayerProgress]:
    """Get player progress by user ID."""
    return db.query(PlayerProgress).filter(PlayerProgress.user_id == user_id).first()


def get_all_player_progress(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerProgress]:
    """Get all player progress records."""
    return db.query(PlayerProgress).offset(skip).limit(limit).all()


def create_player_progress(db: Session, progress_in: PlayerProgressCreate) -> PlayerProgress:
    """Create a new player progress record."""
    db_progress = PlayerProgress(**progress_in.dict())
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


def update_player_progress(
    db: Session, user_id: str, progress_update: PlayerProgressUpdate
) -> Optional[PlayerProgress]:
    """Update player progress."""
    db_progress = get_player_progress_by_user_id(db, user_id)
    if not db_progress:
        return None
    
    update_data = progress_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_progress, field, value)
    
    db.commit()
    db.refresh(db_progress)
    return db_progress


def delete_player_progress(db: Session, progress_id: int) -> bool:
    """Delete player progress by ID."""
    db_progress = get_player_progress(db, progress_id)
    if not db_progress:
        return False
    
    db.delete(db_progress)
    db.commit()
    return True
