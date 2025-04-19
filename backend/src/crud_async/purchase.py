from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.purchase import Purchase
from ..schemas.purchase import PurchaseCreate
from ..models.shop_item import ShopItem
from ..crud.player import get_player, update_player_balance

async def create_purchase_async(db: AsyncSession, purchase: PurchaseCreate) -> Purchase:
    # validações sync podem chamar crud existente
    player = await db.get(get_player.__annotations__['return'].__self__, purchase.player_id)  # workaround
    item = (await db.execute(select(ShopItem).where(ShopItem.id == purchase.shop_item_id))).scalars().first()
    if not player or not item:
        raise ValueError("Jogador ou item não encontrado")
    total_price = item.price * purchase.quantity
    if player.balance < total_price:
        raise ValueError("Saldo insuficiente")
    # debita saldo
    await update_player_balance(db, player.id, -total_price)
    db_purchase = Purchase(player_id=purchase.player_id, shop_item_id=purchase.shop_item_id,
                           quantity=purchase.quantity, total_price=total_price)
    db.add(db_purchase)
    await db.commit()
    await db.refresh(db_purchase)
    return db_purchase

async def get_purchase_async(db: AsyncSession, purchase_id: int) -> Optional[Purchase]:
    result = await db.execute(select(Purchase).where(Purchase.id == purchase_id))
    return result.scalars().first()

async def get_purchases_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Purchase]:
    result = await db.execute(select(Purchase).offset(skip).limit(limit))
    return result.scalars().all()
