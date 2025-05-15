from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud.player import get_player
from ..crud.character import (
    get_character_by_player,
    get_characters_by_player,
    create_character,
    update_character,
    delete_character
)
from ..schemas.character import CharacterCreate, CharacterUpdate, CharacterOut

router = APIRouter(tags=["characters"])


@router.post("/players/{player_id}/characters", response_model=CharacterOut, status_code=status.HTTP_201_CREATED)
def create_character_endpoint(
    player_id: int,
    character_in: CharacterCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new character for a player.
    """
    # First, verify the player exists
    player = get_player(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Create the character
    return create_character(db, player_id, character_in)


@router.get("/players/{player_id}/characters", response_model=List[CharacterOut])
def get_player_characters(
    player_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all characters for a player.
    """
    # First, verify the player exists
    player = get_player(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    return get_characters_by_player(db, player_id, skip, limit)


@router.get("/players/{player_id}/characters/{character_id}", response_model=CharacterOut)
def get_player_character(
    player_id: int,
    character_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific character for a player.
    """
    character = get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    return character


@router.put("/players/{player_id}/characters/{character_id}", response_model=CharacterOut)
def update_player_character(
    player_id: int,
    character_id: int,
    character_update: CharacterUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a player's character.
    """
    # First, verify the character exists and belongs to the player
    character = get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    return update_character(db, character_id, character_update)


@router.delete("/players/{player_id}/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player_character(
    player_id: int,
    character_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a player's character.
    """
    # First, verify the character exists and belongs to the player
    character = get_character_by_player(db, player_id, character_id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    success = delete_character(db, character_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete character"
        )
    
    return None
