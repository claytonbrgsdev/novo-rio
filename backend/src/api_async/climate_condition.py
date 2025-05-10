from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.climate_condition import create_climate_condition_async, get_climate_conditions_async
from ..schemas.climate_condition import ClimateConditionCreate, ClimateConditionOut

router = APIRouter(prefix="/async/climate-conditions", tags=["climate_conditions"])

@router.post("/", response_model=ClimateConditionOut,
             summary="Create Climate Condition (async)",
             description="Asynchronously creates a new climate condition record.\n\nExample request:\n```json\n{ \"condition\": \"rain\", \"intensity\": \"high\" }\n```\nExample response:\n```json\n{ \"id\": 1, \"condition\": \"rain\", \"intensity\": \"high\", \"timestamp\": \"2025-04-20T13:24:00\" }\n```")
async def create_climate_condition_endpoint(
    climate_condition: ClimateConditionCreate,
    db: AsyncSession = Depends(get_async_db())
):
    """Creates a new climate condition asynchronously."""
    return await create_climate_condition_async(db, climate_condition)

@router.get("/", response_model=List[ClimateConditionOut],
            summary="List Climate Conditions (async)",
            description="Asynchronously retrieves climate conditions with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"condition\": \"rain\", \"intensity\": \"high\", \"timestamp\": \"2025-04-20T13:24:00\" }]\n```")
async def list_climate_conditions_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db())
):
    """Returns a list of climate conditions asynchronously."""
    return await get_climate_conditions_async(db, skip, limit)
