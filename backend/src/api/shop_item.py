from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..db import SessionLocal
from ..crud.shop_item import create_shop_item, get_shop_items, get_shop_item
from ..schemas.shop_item import ShopItemCreate, ShopItemOut

router = APIRouter(prefix="/shop-items", tags=["shop_items"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ShopItemOut)
async def create_shop_item_endpoint(item: ShopItemCreate, db: Session = Depends(get_db)):
    return await run_in_threadpool(create_shop_item, db, item)

@router.get("/", response_model=list[ShopItemOut])
async def list_shop_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await run_in_threadpool(get_shop_items, db, skip, limit)

@router.get("/{item_id}", response_model=ShopItemOut)
async def get_shop_item_endpoint(item_id: int, db: Session = Depends(get_db)):
    item = await run_in_threadpool(get_shop_item, db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
