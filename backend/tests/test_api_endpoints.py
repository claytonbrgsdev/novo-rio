import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_terrain_http_crud():
    # Create terrain
    payload = {"player_id": 1, "name": "TerrTest", "x_coordinate": 10.0, "y_coordinate": 20.0, "access_type": "public"}
    res = client.post("/terrains/", json=payload)
    assert res.status_code == 200
    data = res.json()
    terrain_id = data["id"]
    assert data["name"] == "TerrTest"

    # List
    res_list = client.get("/terrains/")
    assert res_list.status_code == 200
    assert any(t["id"] == terrain_id for t in res_list.json())

    # Get
    res_get = client.get(f"/terrains/{terrain_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == terrain_id

    # Update
    res_up = client.put(f"/terrains/{terrain_id}", json={"name": "TerrUpdated"})
    assert res_up.status_code == 200
    assert res_up.json()["name"] == "TerrUpdated"

    # Delete
    res_del = client.delete(f"/terrains/{terrain_id}")
    assert res_del.status_code == 204
    res_not = client.get(f"/terrains/{terrain_id}")
    assert res_not.status_code == 404


def test_shop_items_http_crud():
    # Create shop item
    payload = {"name": "ItemTest", "description": "desc", "price": 5.5}
    res = client.post("/shop-items/", json=payload)
    assert res.status_code == 200
    data = res.json()
    item_id = data["id"]
    assert data["price"] == 5.5

    # List
    res_list = client.get("/shop-items/")
    assert res_list.status_code == 200
    assert any(i["id"] == item_id for i in res_list.json())

    # Get
    res_get = client.get(f"/shop-items/{item_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == item_id


def test_purchase_http_endpoints():
    # Create player and top-up
    player = client.post("/players/", json={"name": "Buyer2", "balance": 100.0})
    assert player.status_code == 200
    pid = player.json()["id"]

    # Create shop item
    item = client.post("/shop-items/", json={"name": "BuyMe", "price": 10.0})
    assert item.status_code == 200
    iid = item.json()["id"]

    # Purchase
    payload = {"player_id": pid, "shop_item_id": iid, "quantity": 3}
    res = client.post("/purchases/", json=payload)
    assert res.status_code == 200
    data = res.json()
    purchase_id = data["id"]
    assert data["total_price"] == pytest.approx(30.0)

    # List
    res_list = client.get("/purchases/")
    assert res_list.status_code == 200
    assert any(p["id"] == purchase_id for p in res_list.json())

    # Get
    res_get = client.get(f"/purchases/{purchase_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == purchase_id


def test_async_agents_endpoint():
    res = client.get("/async/agents/?terrain_id=1")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert all("quadrant" in entry and "agents" in entry for entry in data)
