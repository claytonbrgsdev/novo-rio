import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_whatsapp_with_explicit_command():
    response = client.post(
        "/whatsapp/message", json={"command": "plantar", "terrain_id": 1}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Ação registrada" in data.get("reply", "")

def test_whatsapp_with_free_text():
    response = client.post(
        "/whatsapp/message", json={"message": "regar 2"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Ação registrada" in data.get("reply", "")

def test_whatsapp_unknown_command():
    response = client.post(
        "/whatsapp/message", json={"message": "invalido 3"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("reply") == "Comando 'invalido' não reconhecido"
