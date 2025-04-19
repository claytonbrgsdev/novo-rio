import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_async_players_list():
    response = client.get("/async/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_async_terrains_list():
    response = client.get("/async/terrains")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_async_agents_list():
    response = client.get("/async/agents", params={"terrain_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 15
    for item in data:
        assert "quadrant" in item and "agents" in item


def test_async_terrain_detail():
    terrains = client.get("/async/terrains").json()
    if terrains:
        tid = terrains[0]["id"]
        resp = client.get(f"/async/terrains/{tid}")
        assert resp.status_code in (200, 404)
