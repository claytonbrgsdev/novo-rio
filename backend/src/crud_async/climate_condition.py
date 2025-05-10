from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from ..models.climate_condition import ClimateCondition
from ..schemas.climate_condition import ClimateConditionCreate, ClimateConditionOut

async def create_climate_condition_async(db: AsyncSession, cc: ClimateConditionCreate) -> ClimateCondition:
    db_cc = ClimateCondition(**cc.dict())
    db.add(db_cc)
    await db.commit()
    await db.refresh(db_cc)
    return db_cc

async def get_climate_conditions_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ClimateCondition]:
    result = await db.execute(select(ClimateCondition).offset(skip).limit(limit))
    return result.scalars().all()
