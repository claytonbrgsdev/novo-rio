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

@router.post("/", response_model=ClimateConditionOut)
async def create_climate_condition_endpoint(cc: ClimateConditionCreate, db: Session = Depends(get_db)):
    return await run_in_threadpool(create_climate_condition, db, cc)

@router.get("/", response_model=List[ClimateConditionOut])
async def list_climate_conditions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_threadpool(get_climate_conditions, db, skip, limit)
