import pytest
from src.db import SessionLocal, Base, engine
from src.crud.player import create_player, update_player_balance, get_player
from src.schemas.player import PlayerCreate
from src.crud.shop_item import create_shop_item, get_shop_item, get_shop_items
from src.schemas.shop_item import ShopItemCreate
from src.crud.purchase import create_purchase, get_purchase, get_purchases
from src.schemas.purchase import PurchaseCreate

@pytest.fixture(scope="module", autouse=True)
def prepare_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_shop_item_crud():
    db = SessionLocal()
    # create shop item
    item_in = ShopItemCreate(name="Seed", description="Test seed", price=10.0)
    item = create_shop_item(db, item_in)
    # retrieve
    fetched = get_shop_item(db, item.id)
    assert fetched.name == "Seed"
    assert fetched.price == 10.0
    # list
    all_items = get_shop_items(db)
    assert any(i.id == item.id for i in all_items)
    db.close()


def test_purchase_flow():
    db = SessionLocal()
    # create player
    player = create_player(db, PlayerCreate(name="Buyer"))
    # top-up
    update_player_balance(db, player.id, 100.0)
    player = get_player(db, player.id)
    assert player.balance == pytest.approx(100.0)
    # create shop item
    item = create_shop_item(db, ShopItemCreate(name="Tool", price=25.0))
    # successful purchase
    purchase = create_purchase(
        db,
        PurchaseCreate(player_id=player.id, shop_item_id=item.id, quantity=2)
    )
    assert purchase.total_price == pytest.approx(50.0)
    player = get_player(db, player.id)
    assert player.balance == pytest.approx(50.0)
    # insufficient funds
    with pytest.raises(ValueError):
        create_purchase(
            db,
            PurchaseCreate(player_id=player.id, shop_item_id=item.id, quantity=10)
        )
    # list purchases
    purchases = get_purchases(db)
    assert len(purchases) == 1
    fetched = get_purchase(db, purchase.id)
    assert fetched.id == purchase.id
    db.close()
