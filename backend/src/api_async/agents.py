from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
import random

router = APIRouter(prefix="/async/agents", tags=["agents"])

@router.get("/", response_model=List[Dict[str, Any]])
async def list_agents_async(terrain_id: int, db: AsyncSession = Depends(get_async_db())):
    """
    Stub endpoint: retorna lista de agentes por quadrante do terreno,
    gerando dados aleatórios para demonstração.
    """
    result: List[Dict[str, Any]] = []
    for quadrant in range(1, 16):
        count = random.randint(0, 5)
        agents = [{"id": i + 1} for i in range(count)]
        result.append({"quadrant": quadrant, "agents": agents})
    return result
