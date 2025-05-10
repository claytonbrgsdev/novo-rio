from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.shop_item import create_shop_item_async, get_shop_items_async, get_shop_item_async
from ..schemas.shop_item import ShopItemCreate, ShopItemOut

router = APIRouter(prefix="/async/shop-items", tags=["shop_items"])

@router.post("/", response_model=ShopItemOut)
async def create_shop_item_async_endpoint(item: ShopItemCreate, db: AsyncSession = Depends(get_async_db())):
    return await create_shop_item_async(db, item)

@router.get("/", response_model=list[ShopItemOut])
async def list_shop_items_async(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db())):
    return await get_shop_items_async(db, skip, limit)

@router.get("/{item_id}", response_model=ShopItemOut)
async def get_shop_item_async_endpoint(item_id: int, db: AsyncSession = Depends(get_async_db())):
    item = await get_shop_item_async(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
