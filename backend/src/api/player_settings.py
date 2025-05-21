from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from starlette.concurrency import run_in_threadpool

from ..db import get_db
from ..crud.player_settings import (
    get_player_settings_by_user_id,
    create_player_settings,
    update_player_settings
)
from ..schemas.player_settings import PlayerSettingsCreate, PlayerSettingsUpdate, PlayerSettingsOut

router = APIRouter(tags=["player_settings"])


@router.post("/players/{user_id}/settings", response_model=PlayerSettingsOut, status_code=status.HTTP_201_CREATED)
async def create_settings_endpoint(
    user_id: str,
    settings_in: PlayerSettingsCreate,
    db: Session = Depends(get_db)
):
    """
    Create new settings for a user.
    """
    # Check if settings already exist
    existing_settings = await run_in_threadpool(
        get_player_settings_by_user_id, db, user_id
    )
    
    if existing_settings:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Settings already exist for this user"
        )
    
    # Ensure user_id in path matches the one in request body
    if str(settings_in.user_id) != str(user_id):
        settings_in.user_id = user_id
        
    # Create the settings
    return await run_in_threadpool(
        create_player_settings, db, settings_in
    )


@router.get("/players/{user_id}/settings", response_model=PlayerSettingsOut)
async def get_settings_endpoint(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a user's settings.
    """
    settings = await run_in_threadpool(
        get_player_settings_by_user_id, db, user_id
    )
    
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found"
        )
    
    return settings


@router.put("/players/{user_id}/settings", response_model=PlayerSettingsOut)
async def update_settings_endpoint(
    user_id: str,
    settings_update: PlayerSettingsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user's settings.
    """
    settings = await run_in_threadpool(
        get_player_settings_by_user_id, db, user_id
    )
    
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found"
        )
    
    updated_settings = await run_in_threadpool(
        update_player_settings, db, user_id, settings_update
    )
    
    return updated_settings
