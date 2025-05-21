from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..crud_async.player_progress import (
    get_player_progress_by_user_id,
    create_player_progress,
    update_player_progress
)
from ..schemas.player_progress import PlayerProgressCreate, PlayerProgressUpdate, PlayerProgressOut

router = APIRouter(tags=["player_progress"])


@router.post("/players/{user_id}/progress", response_model=PlayerProgressOut, status_code=status.HTTP_201_CREATED)
async def create_progress_endpoint(
    user_id: str,
    progress_in: PlayerProgressCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new progress record for a user.
    """
    # Check if progress record already exists
    existing_progress = await get_player_progress_by_user_id(db, user_id)
    
    if existing_progress:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Progress record already exists for this user"
        )
    
    # Ensure user_id in path matches the one in request body
    if str(progress_in.user_id) != str(user_id):
        progress_in.user_id = user_id
        
    # Create the progress record
    return await create_player_progress(db, progress_in)


@router.get("/players/{user_id}/progress", response_model=PlayerProgressOut)
async def get_progress_endpoint(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a user's progress.
    """
    progress = await get_player_progress_by_user_id(db, user_id)
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    return progress


@router.put("/players/{user_id}/progress", response_model=PlayerProgressOut)
async def update_progress_endpoint(
    user_id: str,
    progress_update: PlayerProgressUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user's progress.
    """
    progress = await get_player_progress_by_user_id(db, user_id)
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    updated_progress = await update_player_progress(db, user_id, progress_update)
    
    return updated_progress
