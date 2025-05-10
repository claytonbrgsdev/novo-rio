from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.purchase import create_purchase_async, get_purchases_async, get_purchase_async
from ..schemas.purchase import PurchaseCreate, PurchaseOut

router = APIRouter(prefix="/async/purchases", tags=["purchases"])

@router.post("/", response_model=PurchaseOut)
async def create_purchase_async_endpoint(purchase: PurchaseCreate, db: AsyncSession = Depends(get_async_db())):
    try:
        return await create_purchase_async(db, purchase)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[PurchaseOut])
async def list_purchases_async(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db())):
    return await get_purchases_async(db, skip, limit)

@router.get("/{purchase_id}", response_model=PurchaseOut)
async def get_purchase_async_endpoint(purchase_id: int, db: AsyncSession = Depends(get_async_db())):
    p = await get_purchase_async(db, purchase_id)
    if not p:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return p
