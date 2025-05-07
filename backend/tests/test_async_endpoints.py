import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_async_player_crud():
    # Create
    res = client.post("/async/players/", json={"name": "AsyncPlayer", "balance": 20.0})
    assert res.status_code == 200
    player = res.json()
    pid = player["id"]
    assert player["name"] == "AsyncPlayer"
    # List
    res_list = client.get("/async/players/")
    assert res_list.status_code == 200
    assert any(p["id"] == pid for p in res_list.json())
    # Get
    res_get = client.get(f"/async/players/{pid}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == pid
    # Update
    res_up = client.put(f"/async/players/{pid}", json={"name": "AsyncUpdated"})
    assert res_up.status_code == 200
    assert res_up.json()["name"] == "AsyncUpdated"
    # Delete
    res_del = client.delete(f"/async/players/{pid}")
    assert res_del.status_code == 204
    res_not = client.get(f"/async/players/{pid}")
    assert res_not.status_code == 404


def test_async_shop_item_crud():
    # Create
    res = client.post("/async/shop-items/", json={"name": "AsyncItem", "description": "desc", "price": 5.0})
    assert res.status_code == 200
    item = res.json()
    iid = item["id"]
    assert item["price"] == 5.0
    # List
    res_list = client.get("/async/shop-items/")
    assert res_list.status_code == 200
    assert any(i["id"] == iid for i in res_list.json())
    # Get
    res_get = client.get(f"/async/shop-items/{iid}")
    assert res_get.status_code == 200


def test_async_purchase_flow():
    # Setup player and item
    res_p = client.post("/async/players/", json={"name": "BuyerAsync", "balance": 50.0})
    pid2 = res_p.json()["id"]
    res_i = client.post("/async/shop-items/", json={"name": "AsyncBuy", "price": 10.0})
    iid2 = res_i.json()["id"]
    # Successful purchase
    res = client.post("/async/purchases/", json={"player_id": pid2, "shop_item_id": iid2, "quantity": 2})
    assert res.status_code == 200
    pur = res.json()
    purchase_id = pur["id"]
    assert pur["total_price"] == pytest.approx(20.0)
    # List
    res_list = client.get("/async/purchases/")
    assert any(p["id"] == purchase_id for p in res_list.json())
    # Get
    res_get = client.get(f"/async/purchases/{purchase_id}")
    assert res_get.status_code == 200
    # Insufficient funds
    res_err = client.post("/async/purchases/", json={"player_id": pid2, "shop_item_id": iid2, "quantity": 10})
    assert res_err.status_code == 400


def test_async_terrain_crud():
    # Create
    res = client.post("/async/terrains/", json={"player_id": 1, "name": "AsyncTerr", "x_coordinate": 1.0, "y_coordinate": 2.0, "access_type": "pub"})
    assert res.status_code == 200
    terr = res.json()
    tid = terr["id"]
    # List
    res_list = client.get("/async/terrains/")
    assert any(t["id"] == tid for t in res_list.json())
    # Get
    res_get = client.get(f"/async/terrains/{tid}")
    assert res_get.status_code == 200
    # Update
    res_up = client.put(f"/async/terrains/{tid}", json={"name": "AsyncTerrUp"})
    assert res_up.status_code == 200
    assert res_up.json()["name"] == "AsyncTerrUp"
    # Delete
    res_del = client.delete(f"/async/terrains/{tid}")
    assert res_del.status_code == 204


def test_async_climate_condition_flow():
    # Create
    res = client.post("/async/climate-conditions/", json={"name": "AsyncClim", "description": "desc"})
    assert res.status_code == 200
    cc = res.json()
    assert cc["name"] == "AsyncClim"
    # List
    res_list = client.get("/async/climate-conditions/")
    assert any(c["id"] == cc["id"] for c in res_list.json())


def test_async_badge_flow():
    # Setup player
    res_p = client.post("/async/players/", json={"name": "BadgeAsync"})
    pid3 = res_p.json()["id"]
    # Create badge
    res = client.post("/async/badges/", json={"player_id": pid3, "name": "AsyncBadge", "description": "desc"})
    assert res.status_code == 200
    b = res.json()
    assert b["player_id"] == pid3
    # List badges
    res_list = client.get(f"/async/badges/?player_id={pid3}")
    assert any(bb["id"] == b["id"] for bb in res_list.json())
