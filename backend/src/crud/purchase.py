from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.purchase import Purchase
from ..schemas.purchase import PurchaseCreate
from ..models.shop_item import ShopItem
from .player import update_player_balance, get_player


def create_purchase(db: Session, purchase: PurchaseCreate) -> Purchase:
    # verifica existência de jogador e item
    player = get_player(db, purchase.player_id)
    item = db.query(ShopItem).filter(ShopItem.id == purchase.shop_item_id).first()
    if not player or not item:
        raise ValueError("Jogador ou item não encontrado")
    total_price = item.price * purchase.quantity
    # checa saldo
    if player.balance < total_price:
        raise ValueError("Saldo insuficiente")
    # debita do jogador
    update_player_balance(db, player.id, -total_price)
    # cria registro de compra
    db_purchase = Purchase(
        player_id=purchase.player_id,
        shop_item_id=purchase.shop_item_id,
        quantity=purchase.quantity,
        total_price=total_price,
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def get_purchase(db: Session, purchase_id: int) -> Optional[Purchase]:
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()


def get_purchases(db: Session, skip: int = 0, limit: int = 100) -> List[Purchase]:
    return db.query(Purchase).offset(skip).limit(limit).all()
