from typing import List
from fastapi import APIRouter, Depends
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.climate_condition import create_climate_condition, get_climate_conditions
from ..schemas.climate_condition import ClimateConditionCreate, ClimateConditionOut

router = APIRouter(prefix="/climate-conditions", tags=["climate_conditions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ClimateConditionOut,
             summary="Create Climate Condition",
             description="Creates a new climate condition.\n\nExample request:\n```json\n{ \"condition\": \"rain\", \"intensity\": \"high\" }\n```\nExample response:\n```json\n{ \"id\": 1, \"condition\": \"rain\", \"intensity\": \"high\", \"timestamp\": \"2025-04-20T13:24:00\" }\n```")
async def create_climate_condition_endpoint(cc: ClimateConditionCreate, db: Session = Depends(get_db)):
    """Creates a new climate condition record."""
    return await run_in_threadpool(create_climate_condition, db, cc)

@router.get("/", response_model=List[ClimateConditionOut],
            summary="List Climate Conditions",
            description="Retrieves a list of climate conditions with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"condition\": \"rain\", \"intensity\": \"high\", \"timestamp\": \"2025-04-20T13:24:00\" }]\n```")
async def list_climate_conditions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns a list of climate conditions."""
    return await run_in_threadpool(get_climate_conditions, db, skip, limit)
