import os
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from src.main import app
from src.services.plant_lifecycle import tick_day

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    # acelera o tempo: 1 hora = 1 dia
    monkeypatch.setenv("TIME_SCALE_FACTOR", "24")

@pytest.fixture
def db_session():
    from src.db import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


def test_full_plant_flow(db_session):
    # 1) plantio via endpoint
    res = client.post(
        "/action/plant",
        json={"player_id": 1, "species_key": "Cajanus_cajan", "position": {"x": 0, "y": 0}}
    )
    assert res.status_code == 200
    planting = res.json()
    planting_id = planting["id"]

    # 2) avançar ticks até COLHÍVEL
    for _ in range(int(planting.get("maturidade_dias_scaled", 0)) + 1):
        tick_day()

    # 3) colher via endpoint
    res2 = client.post(
        "/action/harvest",
        json={"planting_id": planting_id}
    )
    assert res2.status_code == 200
    res3 = client.get(f"/plantings/{planting_id}")
    assert res3.json().get("current_state") == "COLHIDA"


def test_action_limit_per_cycle(db_session, monkeypatch):
    monkeypatch.setenv("PLAYER_ACTION_LIMIT", "2")
    # execute duas ações de água e confirme 429 na terceira
    res1 = client.post(
        "/action/water",
        json={"planting_id": 1, "volume": 1}
    )
    res2 = client.post(
        "/action/water",
        json={"planting_id": 1, "volume": 1}
    )
    res3 = client.post(
        "/action/water",
        json={"planting_id": 1, "volume": 1}
    )
    assert res3.status_code == 429
