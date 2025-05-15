from typing import List, Optional
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..models.player_progress import PlayerProgress
from ..schemas.player_progress import PlayerProgressCreate, PlayerProgressUpdate
from ..crud.player_progress import (
    get_player_progress as sync_get_player_progress,
    get_player_progress_by_user_id as sync_get_player_progress_by_user_id,
    get_all_player_progress as sync_get_all_player_progress,
    create_player_progress as sync_create_player_progress,
    update_player_progress as sync_update_player_progress,
    delete_player_progress as sync_delete_player_progress
)


async def get_player_progress(db: Session, progress_id: int) -> Optional[PlayerProgress]:
    """Get player progress by ID asynchronously."""
    return await run_in_threadpool(sync_get_player_progress, db, progress_id)


async def get_player_progress_by_user_id(db: Session, user_id: str) -> Optional[PlayerProgress]:
    """Get player progress by user ID asynchronously."""
    return await run_in_threadpool(sync_get_player_progress_by_user_id, db, user_id)


async def get_all_player_progress(db: Session, skip: int = 0, limit: int = 100) -> List[PlayerProgress]:
    """Get all player progress records asynchronously."""
    return await run_in_threadpool(sync_get_all_player_progress, db, skip, limit)


async def create_player_progress(db: Session, progress_in: PlayerProgressCreate) -> PlayerProgress:
    """Create a new player progress record asynchronously."""
    return await run_in_threadpool(sync_create_player_progress, db, progress_in)


async def update_player_progress(
    db: Session, user_id: str, progress_update: PlayerProgressUpdate
) -> Optional[PlayerProgress]:
    """Update player progress asynchronously."""
    return await run_in_threadpool(sync_update_player_progress, db, user_id, progress_update)


async def delete_player_progress(db: Session, progress_id: int) -> bool:
    """Delete player progress by ID asynchronously."""
    return await run_in_threadpool(sync_delete_player_progress, db, progress_id)
