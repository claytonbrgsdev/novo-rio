from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.shop_item import ShopItem
from ..schemas.shop_item import ShopItemCreate

async def create_shop_item_async(db: AsyncSession, item: ShopItemCreate) -> ShopItem:
    db_item = ShopItem(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

async def get_shop_item_async(db: AsyncSession, item_id: int) -> Optional[ShopItem]:
    result = await db.execute(select(ShopItem).where(ShopItem.id == item_id))
    return result.scalars().first()

async def get_shop_items_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ShopItem]:
    result = await db.execute(select(ShopItem).offset(skip).limit(limit))
    return result.scalars().all()
