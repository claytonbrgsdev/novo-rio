from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from starlette.concurrency import run_in_threadpool

from ..db import get_db
from ..crud.player import get_player
from ..crud.player_profile import (
    get_player_profile_by_user_id,
    create_player_profile,
    update_player_profile
)
from ..schemas.player_profile import PlayerProfileCreate, PlayerProfileUpdate, PlayerProfileOut

router = APIRouter(tags=["player_profiles"])


@router.post("/players/{user_id}/profile", response_model=PlayerProfileOut, status_code=status.HTTP_201_CREATED)
async def create_profile_endpoint(
    user_id: str,
    profile_in: PlayerProfileCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new profile for a user.
    """
    # Check if profile already exists
    existing_profile = await run_in_threadpool(
        get_player_profile_by_user_id, db, user_id
    )
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists for this user"
        )
    
    # Ensure user_id in path matches the one in request body
    if str(profile_in.user_id) != str(user_id):
        profile_in.user_id = user_id
        
    # Create the profile
    return await run_in_threadpool(
        create_player_profile, db, profile_in
    )


@router.get("/players/{user_id}/profile", response_model=PlayerProfileOut)
async def get_profile_endpoint(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a user's profile.
    """
    profile = await run_in_threadpool(
        get_player_profile_by_user_id, db, user_id
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.put("/players/{user_id}/profile", response_model=PlayerProfileOut)
async def update_profile_endpoint(
    user_id: str,
    profile_update: PlayerProfileUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user's profile.
    """
    profile = await run_in_threadpool(
        get_player_profile_by_user_id, db, user_id
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    updated_profile = await run_in_threadpool(
        update_player_profile, db, user_id, profile_update
    )
    
    return updated_profile
