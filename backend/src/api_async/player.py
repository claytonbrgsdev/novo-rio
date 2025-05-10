from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.player import create_player_async, get_players_async, get_player_async, update_player_async, delete_player_async
from ..schemas.player import PlayerCreate, PlayerUpdate, PlayerOut

router = APIRouter(prefix="/async/players", tags=["players"])

@router.post("/", response_model=PlayerOut,
             summary="Create Player (async)",
             description="Asynchronously creates a new player.\n\nExample request:\n```json\n{ \"name\": \"Alice\", \"balance\": 0.0 }\n```\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def create_player_endpoint(player: PlayerCreate, db: AsyncSession = Depends(get_async_db())):
    """Creates a new player record asynchronously."""
    return await create_player_async(db, player)

@router.get("/", response_model=List[PlayerOut],
             summary="List Players (async)",
             description="Asynchronously retrieves players with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }]\n```")
async def list_players_endpoint(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db())):
    """Returns a list of players asynchronously."""
    return await get_players_async(db, skip, limit)

@router.get("/{player_id}", response_model=PlayerOut,
             summary="Get Player (async)",
             description="Asynchronously fetches a player by ID.\n\nExample path: `/async/players/1`\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def get_player_endpoint(player_id: int, db: AsyncSession = Depends(get_async_db())):
    """Fetches a player by ID asynchronously."""
    player = await get_player_async(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.put("/{player_id}", response_model=PlayerOut,
             summary="Update Player (async)",
             description="Asynchronously updates a player record.\n\nExample request:\n```json\n{ \"name\": \"Bob\" }\n```")
async def update_player_endpoint(player_id: int, player_update: PlayerUpdate, db: AsyncSession = Depends(get_async_db())):
    """Updates an existing player asynchronously."""
    player = await update_player_async(db, player_id, player_update)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.delete("/{player_id}", status_code=204,
               summary="Delete Player (async)",
               description="Asynchronously deletes a player by ID.")
async def delete_player_endpoint(player_id: int, db: AsyncSession = Depends(get_async_db())):
    """Deletes a player record asynchronously."""
    await delete_player_async(db, player_id)
    return None
