from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.player_profile import PlayerProfile
from ..schemas.player_profile import PlayerProfileCreate, PlayerProfileUpdate


def get_player_profile(db: Session, profile_id: int) -> Optional[PlayerProfile]:
    """Get a player profile by ID."""
    return db.query(PlayerProfile).filter(PlayerProfile.id == profile_id).first()


def get_player_profile_by_user_id(db: Session, user_id: str) -> Optional[PlayerProfile]:
    """Get a player profile by user ID."""
    return db.query(PlayerProfile).filter(PlayerProfile.user_id == user_id).first()


def get_player_profiles(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerProfile]:
    """Get all player profiles."""
    return db.query(PlayerProfile).offset(skip).limit(limit).all()


def create_player_profile(db: Session, profile_in: PlayerProfileCreate) -> PlayerProfile:
    """Create a new player profile."""
    db_profile = PlayerProfile(**profile_in.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


def update_player_profile(
    db: Session, user_id: str, profile_update: PlayerProfileUpdate
) -> Optional[PlayerProfile]:
    """Update a player profile."""
    db_profile = get_player_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    
    update_data = profile_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


def delete_player_profile(db: Session, profile_id: int) -> bool:
    """Delete a player profile by ID."""
    db_profile = get_player_profile(db, profile_id)
    if not db_profile:
        return False
    
    db.delete(db_profile)
    db.commit()
    return True
