import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

@ pytest.fixture(autouse=True)
def setup_db():
    # tables created on startup event
    yield


def test_badge_crud_flow():
    # Create player
    player_resp = client.post("/players/", json={"name": "Player1"})
    assert player_resp.status_code == 200
    player_id = player_resp.json()["id"]

    # Create badge
    badge_payload = {"player_id": player_id, "name": "Conservationist", "description": "Protector"}
    badge_resp = client.post("/badges/", json=badge_payload)
    assert badge_resp.status_code == 200
    badge_data = badge_resp.json()
    assert badge_data["player_id"] == player_id
    assert badge_data["name"] == "Conservationist"

    # List badges
    list_resp = client.get(f"/badges/?player_id={player_id}")
    assert list_resp.status_code == 200
    badges = list_resp.json()
    assert isinstance(badges, list)
    assert any(b["id"] == badge_data["id"] for b in badges)
