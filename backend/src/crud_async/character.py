from typing import List, Optional
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..models.character import Character
from ..schemas.character import CharacterCreate, CharacterUpdate
from ..crud.character import (
    get_character as sync_get_character,
    get_character_by_player as sync_get_character_by_player,
    get_characters_by_player as sync_get_characters_by_player,
    create_character as sync_create_character,
    update_character as sync_update_character,
    delete_character as sync_delete_character
)


async def get_character(db: Session, character_id: int) -> Optional[Character]:
    """Get a character by ID asynchronously."""
    return await run_in_threadpool(sync_get_character, db, character_id)


async def get_character_by_player(db: Session, player_id: int, character_id: int) -> Optional[Character]:
    """Get a specific character belonging to a player asynchronously."""
    return await run_in_threadpool(sync_get_character_by_player, db, player_id, character_id)


async def get_characters_by_player(db: Session, player_id: int, skip: int = 0, limit: int = 100) -> List[Character]:
    """Get all characters for a specific player asynchronously."""
    return await run_in_threadpool(sync_get_characters_by_player, db, player_id, skip, limit)


async def create_character(db: Session, player_id: int, character_in: CharacterCreate) -> Character:
    """Create a new character for a player asynchronously."""
    return await run_in_threadpool(sync_create_character, db, player_id, character_in)


async def update_character(
    db: Session, character_id: int, character_update: CharacterUpdate
) -> Optional[Character]:
    """Update a character's information asynchronously."""
    return await run_in_threadpool(sync_update_character, db, character_id, character_update)


async def delete_character(db: Session, character_id: int) -> bool:
    """Delete a character by ID asynchronously."""
    return await run_in_threadpool(sync_delete_character, db, character_id)
