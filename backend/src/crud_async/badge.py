from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from ..models.badge import Badge
from ..schemas.badge import BadgeCreate

async def create_badge_async(db: AsyncSession, badge: BadgeCreate) -> Badge:
    db_badge = Badge(**badge.dict())
    db.add(db_badge)
    await db.commit()
    await db.refresh(db_badge)
    return db_badge

async def get_badges_async(db: AsyncSession, player_id: int) -> List[Badge]:
    result = await db.execute(select(Badge).where(Badge.player_id == player_id))
    return result.scalars().all()
