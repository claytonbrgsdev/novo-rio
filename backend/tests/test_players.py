import pytest

@pytest.mark.order(1)
def test_create_player(client):
    payload = {"name": "TestPlayer", "balance": 50.0} # Aura should take default value
    res = client.post("/players/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "TestPlayer"
    assert data["balance"] == 50.0
    assert "aura" in data
    assert data["aura"] == 100.0  # Check default aura
    pytest.player_id = data["id"]

@pytest.mark.order(2)
def test_list_and_get_player(client):
    # List
    res_list = client.get("/players/")
    assert res_list.status_code == 200
    players_data = res_list.json()
    found_player = None
    for p in players_data:
        assert "aura" in p # Check aura presence in list items
        if p["id"] == pytest.player_id:
            found_player = p
    assert found_player is not None
    assert found_player["aura"] == 100.0 # Check default aura for the created player

    # Get
    res_get = client.get(f"/players/{pytest.player_id}")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["name"] == "TestPlayer"
    assert "aura" in data
    assert data["aura"] == 100.0 # Check default aura on direct get

@pytest.mark.order(3)
def test_update_player(client):
    updated_aura_value = 75.5
    res = client.put(f"/players/{pytest.player_id}", json={"name": "UpdatedPlayer", "aura": updated_aura_value})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "UpdatedPlayer"
    assert "aura" in data
    assert data["aura"] == updated_aura_value # Check updated aura

@pytest.mark.order(4)
def test_delete_player(client):
    res = client.delete(f"/players/{pytest.player_id}")
    assert res.status_code == 204
    # Confirm deletion
    res_get = client.get(f"/players/{pytest.player_id}")
    assert res_get.status_code == 404
