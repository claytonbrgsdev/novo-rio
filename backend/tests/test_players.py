import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

@pytest.mark.order(1)
def test_create_player():
    payload = {"name": "TestPlayer", "balance": 50.0}
    res = client.post("/players/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "TestPlayer"
    assert data["balance"] == 50.0
    pytest.player_id = data["id"]

@pytest.mark.order(2)
def test_list_and_get_player():
    # List
    res_list = client.get("/players/")
    assert res_list.status_code == 200
    ids = [p["id"] for p in res_list.json()]
    assert pytest.player_id in ids

    # Get
    res_get = client.get(f"/players/{pytest.player_id}")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["name"] == "TestPlayer"

@pytest.mark.order(3)
def test_update_player():
    res = client.put(f"/players/{pytest.player_id}", json={"name": "UpdatedPlayer"})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "UpdatedPlayer"

@pytest.mark.order(4)
def test_delete_player():
    res = client.delete(f"/players/{pytest.player_id}")
    assert res.status_code == 204
    # Confirm deletion
    res_get = client.get(f"/players/{pytest.player_id}")
    assert res_get.status_code == 404
