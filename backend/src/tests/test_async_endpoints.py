import pytest


def test_async_players_list(client):
    response = client.get("/async/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_async_terrains_list(client):
    response = client.get("/async/terrains")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_async_agents_list(client):
    response = client.get("/async/agents", params={"terrain_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 15
    for item in data:
        assert "quadrant" in item and "agents" in item


def test_async_terrain_detail(client):
    terrains = client.get("/async/terrains").json()
    if terrains:
        tid = terrains[0]["id"]
        resp = client.get(f"/async/terrains/{tid}")
        assert resp.status_code in (200, 404)

# Testar listagem de condições climáticas
def test_async_climate_list(client):
    response = client.get("/async/climate-conditions", params={"skip": 0, "limit": 10})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Testar listagem de badges
def test_async_badges_list(client):
    players = client.get("/async/players").json()
    assert players
    pid = players[0]["id"]
    response = client.get("/async/badges", params={"player_id": pid})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
