from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db, get_async_db
from ..crud.player import create_player, get_player, get_players, update_player, delete_player
from ..schemas.player import PlayerCreate, PlayerUpdate, PlayerOut, PlayerWithTerrainsOut
from ..schemas.terrain import TerrainOut
from ..models.terrain import Terrain
from ..models.player import Player

router = APIRouter(prefix="/players", tags=["players"])

@router.post("/", response_model=PlayerOut,
             summary="Create Player",
             description="Creates a new player.\n\nExample request:\n```json\n{ \"name\": \"Alice\", \"balance\": 0.0 }\n```\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def create_player_endpoint(player: PlayerCreate, db: Session = Depends(get_db)):
    """Creates a new player record."""
    try:
        return create_player(db, player)
    except Exception as e:
        print(f"Error creating player: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create player: {str(e)}")

@router.get("/", response_model=List[PlayerOut],
            summary="List Players",
            description="Retrieves a list of players with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }]\n```")
async def list_players(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    """Returns a list of players."""
    try:
        # Usar o método adequado para consultas assíncronas
        result = await db.execute(Player.__table__.select().offset(skip).limit(limit))
        players = result.fetchall()
        return [PlayerOut.from_orm(player) for player in players]
    except Exception as e:
        # Adicionar log detalhado e informativo para facilitar a depuração
        print(f"Error fetching players: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch players: {str(e)}"
        )

@router.get("/{player_id}", response_model=PlayerOut,
            summary="Get Player",
            description="Retrieves a single player by its ID.\n\nExample path: `/players/1`\nExample response:\n```json\n{ \"id\": 1, \"name\": \"Alice\", \"balance\": 0.0 }\n```")
async def get_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    """Fetches a player by ID."""
    try:
        db_player = get_player(db, player_id)
        if not db_player:
            raise HTTPException(status_code=404, detail="Player not found")
        return db_player
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching player: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch player: {str(e)}")

@router.put("/{player_id}", response_model=PlayerOut,
            summary="Update Player",
            description="Updates player information.\n\nExample request:\n```json\n{ \"name\": \"Bob\" }\n```")
async def update_player_endpoint(player_id: int, player_update: PlayerUpdate, db: Session = Depends(get_db)):
    """Updates an existing player."""
    try:
        db_player = update_player(db, player_id, player_update)
        if not db_player:
            raise HTTPException(status_code=404, detail="Player not found")
        return db_player
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating player: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update player: {str(e)}")

@router.delete("/{player_id}", status_code=204,
               summary="Delete Player",
               description="Deletes a player by ID.")
async def delete_player_endpoint(player_id: int, db: Session = Depends(get_db)):
    """Deletes a player record."""
    try:
        success = delete_player(db, player_id)
        if not success:
            raise HTTPException(status_code=404, detail="Player not found")
        return None
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error deleting player: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete player: {str(e)}")


@router.get("/{player_id}/terrains", response_model=List[TerrainOut],
           summary="Get Player's Terrains",
           description="Retrieves all terrains owned by a specific player.\n\nExample path: `/players/1/terrains`\nExample response:\n```json\n[{ \"id\": 1, \"player_id\": 1, \"name\": \"Forest Lot\" }]\n```")
async def get_player_terrains(player_id: int, db: Session = Depends(get_db)):
    """Fetches all terrains for a specific player."""
    try:
        # First verify the player exists
        player = get_player(db, player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Query terrains for this player
        terrains = db.query(Terrain).filter(Terrain.player_id == player_id).all()
        return terrains
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching player terrains: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch player terrains: {str(e)}")


@router.get("/{player_id}/with-terrains", response_model=PlayerWithTerrainsOut,
            summary="Get Player with Terrains",
            description="Retrieves a player along with all their terrains in a single response.\n\nExample path: `/players/1/with-terrains`")
async def get_player_with_terrains(player_id: int, db: Session = Depends(get_db)):
    """Fetches a player by ID with their associated terrains."""
    try:
        player = get_player(db, player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching player with terrains: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch player with terrains: {str(e)}")
