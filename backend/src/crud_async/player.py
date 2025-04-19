from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.player import Player
from ..schemas.player import PlayerCreate, PlayerUpdate

async def create_player_async(db: AsyncSession, player_in: PlayerCreate) -> Player:
    db_player = Player(**player_in.dict())
    db.add(db_player)
    await db.commit()
    await db.refresh(db_player)
    return db_player

async def get_player_async(db: AsyncSession, player_id: int) -> Optional[Player]:
    result = await db.execute(select(Player).where(Player.id == player_id))
    return result.scalars().first()

async def get_players_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Player]:
    result = await db.execute(select(Player).offset(skip).limit(limit))
    return result.scalars().all()

async def update_player_async(db: AsyncSession, player_id: int, player_update: PlayerUpdate) -> Optional[Player]:
    player = await get_player_async(db, player_id)
    if player:
        for var, value in player_update.dict(exclude_unset=True).items():
            setattr(player, var, value)
        await db.commit()
        await db.refresh(player)
    return player

async def delete_player_async(db: AsyncSession, player_id: int) -> None:
    player = await get_player_async(db, player_id)
    if player:
        await db.delete(player)
        await db.commit()
