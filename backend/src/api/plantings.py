from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db_override
from ..models.planting import Planting
from ..schemas.planting import PlantingSchema

router = APIRouter(prefix="/plantings", tags=["plantings"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[PlantingSchema], summary="List Plantings")
def list_plantings(player_id: int, db: Session = Depends(get_db)):
    """Lista todos os plantios de um jogador"""
    return db.query(Planting).filter(Planting.player_id == player_id).all()

@router.get("/{planting_id}", response_model=PlantingSchema, summary="Get Planting")
def get_planting(planting_id: int, db: Session = Depends(get_db)):
    """Retorna um plantio pelo ID"""
    planting = db.query(Planting).filter(Planting.id == planting_id).first()
    if not planting:
        raise HTTPException(status_code=404, detail="Planting not found")
    return planting
