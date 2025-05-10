from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.badge import create_badge_async, get_badges_async
from ..schemas.badge import BadgeCreate, BadgeOut

router = APIRouter(prefix="/async/badges", tags=["badges"])

@router.post("/", response_model=BadgeOut)
async def create_badge_endpoint(
    badge: BadgeCreate,
    db: AsyncSession = Depends(get_async_db())
):
    """
    Endpoint para criar badge
    """
    db_badge = await create_badge_async(db, badge)
    return db_badge

@router.get("/", response_model=List[BadgeOut])
async def list_badges_endpoint(
    player_id: int,
    db: AsyncSession = Depends(get_async_db())
):
    """
    Endpoint para listar badges de um jogador
    """
    return await get_badges_async(db, player_id)
