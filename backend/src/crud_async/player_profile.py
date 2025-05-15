from typing import List, Optional
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..models.player_profile import PlayerProfile
from ..schemas.player_profile import PlayerProfileCreate, PlayerProfileUpdate
from ..crud.player_profile import (
    get_player_profile as sync_get_player_profile,
    get_player_profile_by_user_id as sync_get_player_profile_by_user_id,
    get_player_profiles as sync_get_player_profiles,
    create_player_profile as sync_create_player_profile,
    update_player_profile as sync_update_player_profile,
    delete_player_profile as sync_delete_player_profile
)


async def get_player_profile(db: Session, profile_id: int) -> Optional[PlayerProfile]:
    """Get a player profile by ID asynchronously."""
    return await run_in_threadpool(sync_get_player_profile, db, profile_id)


async def get_player_profile_by_user_id(db: Session, user_id: str) -> Optional[PlayerProfile]:
    """Get a player profile by user ID asynchronously."""
    return await run_in_threadpool(sync_get_player_profile_by_user_id, db, user_id)


async def get_player_profiles(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerProfile]:
    """Get all player profiles asynchronously."""
    return await run_in_threadpool(sync_get_player_profiles, db, skip, limit)


async def create_player_profile(db: Session, profile_in: PlayerProfileCreate) -> PlayerProfile:
    """Create a new player profile asynchronously."""
    return await run_in_threadpool(sync_create_player_profile, db, profile_in)


async def update_player_profile(
    db: Session, user_id: str, profile_update: PlayerProfileUpdate
) -> Optional[PlayerProfile]:
    """Update a player profile asynchronously."""
    return await run_in_threadpool(sync_update_player_profile, db, user_id, profile_update)


async def delete_player_profile(db: Session, profile_id: int) -> bool:
    """Delete a player profile by ID asynchronously."""
    return await run_in_threadpool(sync_delete_player_profile, db, profile_id)
