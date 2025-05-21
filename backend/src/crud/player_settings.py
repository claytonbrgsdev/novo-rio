from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.player_settings import PlayerSettings
from ..schemas.player_settings import PlayerSettingsCreate, PlayerSettingsUpdate


def get_player_settings(db: Session, settings_id: int) -> Optional[PlayerSettings]:
    """Get player settings by ID."""
    return db.query(PlayerSettings).filter(PlayerSettings.id == settings_id).first()


def get_player_settings_by_user_id(db: Session, user_id: str) -> Optional[PlayerSettings]:
    """Get player settings by user ID."""
    return db.query(PlayerSettings).filter(PlayerSettings.user_id == user_id).first()


def get_all_player_settings(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerSettings]:
    """Get all player settings records."""
    return db.query(PlayerSettings).offset(skip).limit(limit).all()


def create_player_settings(db: Session, settings_in: PlayerSettingsCreate) -> PlayerSettings:
    """Create new player settings record."""
    db_settings = PlayerSettings(**settings_in.dict())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings


def update_player_settings(
    db: Session, user_id: str, settings_update: PlayerSettingsUpdate
) -> Optional[PlayerSettings]:
    """Update player settings."""
    db_settings = get_player_settings_by_user_id(db, user_id)
    if not db_settings:
        return None
    
    update_data = settings_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings


def delete_player_settings(db: Session, settings_id: int) -> bool:
    """Delete player settings by ID."""
    db_settings = get_player_settings(db, settings_id)
    if not db_settings:
        return False
    
    db.delete(db_settings)
    db.commit()
    return True
