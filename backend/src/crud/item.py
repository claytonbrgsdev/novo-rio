from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.item import Item
from ..schemas.item import ItemCreate, ItemOut

def create_item(db: Session, item: ItemCreate) -> Item:
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_item(db: Session, item_id: int) -> Optional[Item]:
    return db.query(Item).filter(Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
    return db.query(Item).offset(skip).limit(limit).all()

def delete_item(db: Session, item_id: int) -> None:
    db_item = get_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
