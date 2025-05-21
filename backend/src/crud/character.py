from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.character import Character
from ..schemas.character import CharacterCreate, CharacterUpdate


def get_character(db: Session, character_id: int) -> Optional[Character]:
    """Get a character by ID."""
    return db.query(Character).filter(Character.id == character_id).first()


def get_character_by_player(db: Session, player_id: int, character_id: int) -> Optional[Character]:
    """Get a specific character belonging to a player."""
    return db.query(Character).filter(
        Character.player_id == player_id,
        Character.id == character_id
    ).first()


def get_characters_by_player(db: Session, player_id: int, skip: int = 0, limit: int = 100) -> List[Character]:
    """Get all characters for a specific player."""
    return db.query(Character).filter(
        Character.player_id == player_id
    ).offset(skip).limit(limit).all()


def create_character(db: Session, player_id: int, character_in: CharacterCreate) -> Character:
    """Create a new character for a player."""
    db_character = Character(
        player_id=player_id,
        name=character_in.name,
        head_id=character_in.head_id,
        body_id=character_in.body_id,
        tool_id=character_in.tool_id
    )
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character


def update_character(
    db: Session, character_id: int, character_update: CharacterUpdate
) -> Optional[Character]:
    """Update a character's information."""
    db_character = get_character(db, character_id)
    if not db_character:
        return None
    
    update_data = character_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_character, field, value)
    
    db.commit()
    db.refresh(db_character)
    return db_character


def delete_character(db: Session, character_id: int) -> bool:
    """Delete a character by ID."""
    db_character = get_character(db, character_id)
    if not db_character:
        return False
    
    db.delete(db_character)
    db.commit()
    return True
