from typing import List, Optional
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..models.player_settings import PlayerSettings
from ..schemas.player_settings import PlayerSettingsCreate, PlayerSettingsUpdate
from ..crud.player_settings import (
    get_player_settings as sync_get_player_settings,
    get_player_settings_by_user_id as sync_get_player_settings_by_user_id,
    get_all_player_settings as sync_get_all_player_settings,
    create_player_settings as sync_create_player_settings,
    update_player_settings as sync_update_player_settings,
    delete_player_settings as sync_delete_player_settings
)


async def get_player_settings(db: Session, settings_id: int) -> Optional[PlayerSettings]:
    """Get player settings by ID asynchronously."""
    return await run_in_threadpool(sync_get_player_settings, db, settings_id)


async def get_player_settings_by_user_id(db: Session, user_id: str) -> Optional[PlayerSettings]:
    """Get player settings by user ID asynchronously."""
    return await run_in_threadpool(sync_get_player_settings_by_user_id, db, user_id)


async def get_all_player_settings(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerSettings]:
    """Get all player settings records asynchronously."""
    return await run_in_threadpool(sync_get_all_player_settings, db, skip, limit)


async def create_player_settings(db: Session, settings_in: PlayerSettingsCreate) -> PlayerSettings:
    """Create new player settings record asynchronously."""
    return await run_in_threadpool(sync_create_player_settings, db, settings_in)


async def update_player_settings(
    db: Session, user_id: str, settings_update: PlayerSettingsUpdate
) -> Optional[PlayerSettings]:
    """Update player settings asynchronously."""
    return await run_in_threadpool(sync_update_player_settings, db, user_id, settings_update)


async def delete_player_settings(db: Session, settings_id: int) -> bool:
    """Delete player settings by ID asynchronously."""
    return await run_in_threadpool(sync_delete_player_settings, db, settings_id)
