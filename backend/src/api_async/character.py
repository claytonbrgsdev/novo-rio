from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud_async.player import get_player_async as get_player
from ..crud_async.character import (
    get_character_by_player,
    get_characters_by_player,
    create_character,
    update_character,
    delete_character
)
from ..schemas.character import CharacterCreate, CharacterUpdate, CharacterOut

router = APIRouter(tags=["characters"])


@router.post("/players/{player_id}/characters", response_model=CharacterOut, status_code=status.HTTP_201_CREATED)
async def create_character_endpoint(
    player_id: int,
    character_in: CharacterCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new character for a player.
    """
    # First, verify the player exists
    player = await get_player(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Create the character
    return await create_character(db, player_id, character_in)


@router.get("/players/{player_id}/characters", response_model=List[CharacterOut])
async def get_player_characters(
    player_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all characters for a player.
    """
    # First, verify the player exists
    player = await get_player(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    return await get_characters_by_player(db, player_id, skip, limit)


@router.get("/players/{player_id}/characters/{character_id}", response_model=CharacterOut)
async def get_player_character(
    player_id: int,
    character_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific character for a player.
    """
    character = await get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    return character


@router.put("/players/{player_id}/characters/{character_id}", response_model=CharacterOut)
async def update_player_character(
    player_id: int,
    character_id: int,
    character_update: CharacterUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a player's character.
    """
    # First, verify the character exists and belongs to the player
    character = await get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    return await update_character(db, character_id, character_update)


@router.delete("/players/{player_id}/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_player_character(
    player_id: int,
    character_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a player's character.
    """
    # First, verify the character exists and belongs to the player
    character = await get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    success = await delete_character(db, character_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete character"
        )
    
    return None
