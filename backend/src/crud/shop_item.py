from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.shop_item import ShopItem
from ..schemas.shop_item import ShopItemCreate


def create_shop_item(db: Session, item: ShopItemCreate) -> ShopItem:
    db_item = ShopItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_shop_item(db: Session, item_id: int) -> Optional[ShopItem]:
    return db.query(ShopItem).filter(ShopItem.id == item_id).first()


def get_shop_items(db: Session, skip: int = 0, limit: int = 100) -> List[ShopItem]:
    return db.query(ShopItem).offset(skip).limit(limit).all()
