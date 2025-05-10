# backend/src/tests/test_async_endpoints.py

import sys
import os
# Garante que a pasta `backend` fique no path para que `import src` funcione
current_dir = os.path.abspath(os.path.dirname(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi.testclient import TestClient
import pytest

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


def test_async_climate_list():
    response = client.get("/async/climate-conditions", params={"skip": 0, "limit": 10})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_async_badges_list():
    players = client.get("/async/players").json()
    assert players
    pid = players[0]["id"]
    response = client.get("/async/badges", params={"player_id": pid})
    assert response.status_code == 200
    assert isinstance(response.json(), list)