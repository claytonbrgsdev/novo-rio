from typing import List
from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud.player import create_player, get_player, get_players, update_player, delete_player
from ..schemas.player import PlayerCreate, PlayerUpdate, PlayerOut

router = APIRouter(prefix="/players", tags=["players"])

@router.post("/", response_model=PlayerOut,
             summary="Create Player",
             description="Creates a new player.\n\nExample request:\n```json\n{ \"name\": \"Alice\", \"balance\": 0.0 }\n```\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def create_player_endpoint(player: PlayerCreate, db: Session = Depends(get_db)):
    """Creates a new player record."""
    return await run_in_threadpool(create_player, db, player)

@router.get("/", response_model=List[PlayerOut],
            summary="List Players",
            description="Retrieves a list of players with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }]\n```")
async def list_players(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns a list of players."""
    return await run_in_threadpool(get_players, db, skip, limit)

@router.get("/{player_id}", response_model=PlayerOut,
            summary="Get Player",
            description="Retrieves a single player by its ID.\n\nExample path: `/players/1`\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def get_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    """Fetches a player by ID."""
    db_player = await run_in_threadpool(get_player, db, player_id)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.put("/{player_id}", response_model=PlayerOut,
            summary="Update Player",
            description="Updates player information.\n\nExample request:\n```json\n{ \"name\": \"Bob\" }\n```")
async def update_player_endpoint(player_id: int, player_update: PlayerUpdate, db: Session = Depends(get_db)):
    """Updates an existing player."""
    db_player = await run_in_threadpool(update_player, db, player_id, player_update)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.delete("/{player_id}", status_code=204,
               summary="Delete Player",
               description="Deletes a player by ID.")
async def delete_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    """Deletes a player record."""
    await run_in_threadpool(delete_player, db, player_id)
    return None
