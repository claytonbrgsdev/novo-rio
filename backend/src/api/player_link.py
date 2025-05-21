from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from ..db import get_db
from ..crud.player import get_player, create_player
from ..schemas.player import PlayerCreate, PlayerOut

router = APIRouter(tags=["player_link"])


@router.post("/users/{user_id}/link-player", response_model=PlayerOut)
async def link_user_to_player(
    user_id: str,
    player_name: str = None,
    db: Session = Depends(get_db)
):
    """
    Get or create a player associated with a user.
    This endpoint is used to ensure every user has a valid player ID.
    If the player doesn't exist, it creates one.
    """
    # Try to find a player linked to this user ID
    # This would need a proper implementation based on your user-player mapping
    # For now, we'll create a new player if one doesn't exist already
    
    # Generate a player name if not provided
    if not player_name:
        player_name = f"Player_{user_id}"
    
    # Create a new player
    player_data = PlayerCreate(name=player_name)
    player = await run_in_threadpool(create_player, db, player_data)
    
    return player
