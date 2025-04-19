import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # tables created on startup event
    yield


def test_climate_condition_crud_flow():
    # Create climate condition
    cc_payload = {"name": "Seca", "description": "Clima seco"}
    cc_resp = client.post("/climate-conditions/", json=cc_payload)
    assert cc_resp.status_code == 200
    cc_data = cc_resp.json()
    assert cc_data["name"] == "Seca"

    # List climate conditions
    list_resp = client.get("/climate-conditions/?skip=0&limit=10")
    assert list_resp.status_code == 200
    ccs = list_resp.json()
    assert isinstance(ccs, list)
    assert any(c["id"] == cc_data["id"] for c in ccs)
