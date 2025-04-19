from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.player import (
    create_player_async,
    get_players_async,
    get_player_async,
    update_player_async,
    delete_player_async,
)
from ..schemas.player import PlayerCreate, PlayerUpdate, PlayerOut

router = APIRouter(prefix="/async/players", tags=["players"])

@router.post("/", response_model=PlayerOut)
async def create_player_endpoint(player: PlayerCreate, db: AsyncSession = Depends(get_async_db)):
    return await create_player_async(db, player)

@router.get("/", response_model=List[PlayerOut])
async def list_players_endpoint(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    return await get_players_async(db, skip, limit)

@router.get("/{player_id}", response_model=PlayerOut)
async def get_player_endpoint(player_id: int, db: AsyncSession = Depends(get_async_db)):
    player = await get_player_async(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.put("/{player_id}", response_model=PlayerOut)
async def update_player_endpoint(player_id: int, player_update: PlayerUpdate, db: AsyncSession = Depends(get_async_db)):
    player = await update_player_async(db, player_id, player_update)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.delete("/{player_id}", status_code=204)
async def delete_player_endpoint(player_id: int, db: AsyncSession = Depends(get_async_db)):
    await delete_player_async(db, player_id)
    return None
