from typing import List
from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.player import create_player, get_player, get_players, update_player, delete_player
from ..schemas.player import PlayerCreate, PlayerUpdate, PlayerOut

router = APIRouter(prefix="/players", tags=["players"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PlayerOut)
async def create_player_endpoint(player: PlayerCreate, db: Session = Depends(get_db)):
    return await run_in_threadpool(create_player, db, player)

@router.get("/", response_model=List[PlayerOut])
async def list_players(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_threadpool(get_players, db, skip, limit)

@router.get("/{player_id}", response_model=PlayerOut)
async def get_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    db_player = await run_in_threadpool(get_player, db, player_id)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.put("/{player_id}", response_model=PlayerOut)
async def update_player_endpoint(player_id: int, player_update: PlayerUpdate, db: Session = Depends(get_db)):
    db_player = await run_in_threadpool(update_player, db, player_id, player_update)
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.delete("/{player_id}", status_code=204)
async def delete_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    await run_in_threadpool(delete_player, db, player_id)
    return None
