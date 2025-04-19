from typing import List
from fastapi import APIRouter, Depends
from starlette.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_async_db
from ..crud.badge import create_badge, get_badges
from ..schemas.badge import BadgeCreate, BadgeOut

router = APIRouter(prefix="/async/badges", tags=["badges"])

@router.post("/", response_model=BadgeOut)
async def create_badge_async(
    badge: BadgeCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Endpoint assíncrono para criar badge
    """
    return await run_in_threadpool(create_badge, db, badge)

@router.get("/", response_model=List[BadgeOut])
async def list_badges_async(
    player_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Endpoint assíncrono para listar badges de um jogador
    """
    return await run_in_threadpool(get_badges, db, player_id)
