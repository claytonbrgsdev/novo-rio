from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..db import SessionLocal
from ..crud.purchase import create_purchase, get_purchases, get_purchase
from ..schemas.purchase import PurchaseCreate, PurchaseOut

router = APIRouter(prefix="/purchases", tags=["purchases"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PurchaseOut)
async def create_purchase_endpoint(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    try:
        return await run_in_threadpool(create_purchase, db, purchase)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[PurchaseOut])
async def list_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_threadpool(get_purchases, db, skip, limit)

@router.get("/{purchase_id}", response_model=PurchaseOut)
async def get_purchase_endpoint(purchase_id: int, db: Session = Depends(get_db)):
    p = await run_in_threadpool(get_purchase, db, purchase_id)
    if not p:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return p
