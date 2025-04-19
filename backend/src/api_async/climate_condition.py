from typing import List
from fastapi import APIRouter, Depends
from starlette.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud.climate_condition import create_climate_condition, get_climate_conditions
from ..schemas.climate_condition import ClimateConditionCreate, ClimateConditionOut

router = APIRouter(prefix="/async/climate-conditions", tags=["climate_conditions"])

@router.post("/", response_model=ClimateConditionOut)
async def create_climate_condition_async(
    cc: ClimateConditionCreate,
    db: AsyncSession = Depends(get_async_db)
):
    return await run_in_threadpool(create_climate_condition, db, cc)

@router.get("/", response_model=List[ClimateConditionOut])
async def list_climate_conditions_async(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db)
):
    return await run_in_threadpool(get_climate_conditions, db, skip, limit)
