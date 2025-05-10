from sqlalchemy.orm import Session
from sqlalchemy import select

from ..models.player import Player
from ..schemas.player import PlayerCreate, PlayerUpdate
from typing import List, Optional

def create_player(db: Session, player: PlayerCreate) -> Player:
    db_player = Player(**player.dict())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def get_player(db: Session, player_id: int) -> Optional[Player]:
    return db.query(Player).filter(Player.id == player_id).first()

def get_players(db: Session, skip: int = 0, limit: int = 100) -> List[Player]:
    return db.query(Player).offset(skip).limit(limit).all()

def update_player(db: Session, player_id: int, player_update: PlayerUpdate) -> Optional[Player]:
    player = get_player(db, player_id)
    if player:
        for var, value in player_update.dict(exclude_unset=True).items():
            setattr(player, var, value)
        db.commit()
        db.refresh(player)
    return player

def update_player_balance(db: Session, player_id: int, amount: float):
    player = get_player(db, player_id)
    if player:
        player.balance = (player.balance or 0) + amount
        db.commit()
        db.refresh(player)
    return player

def delete_player(db: Session, player_id: int) -> None:
    player = get_player(db, player_id)
    if player:
        db.delete(player)
        db.commit()
