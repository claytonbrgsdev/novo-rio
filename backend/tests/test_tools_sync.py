import pytest

TOOL_PAYLOAD = {
    "common_name": "Martelo",
    "key": "hammer",
    "description": "Ferramenta de teste",
    "task_type": "construir",
    "efficiency": 0.8,
    "durability": 100,
    "compatible_with": ["madeira", "metal"],
    "effects": {"build_speed": 1.2}
}

UPDATED_PAYLOAD = {
    "common_name": "Martelo Atualizado",
    "key": "hammer",
    "description": "Ferramenta atualizada",
    "task_type": "construir",
    "efficiency": 0.9,
    "durability": 120,
    "compatible_with": ["madeira", "metal", "plastico"],
    "effects": {"build_speed": 1.5}
}

def test_tool_crud_sync(client):
    # Cria
    resp = client.post("/tools/", json=TOOL_PAYLOAD)
    assert resp.status_code == 200
    tool = resp.json()
    tool_id = tool["id"]
    assert tool["common_name"] == TOOL_PAYLOAD["common_name"]

    # Lista
    resp = client.get("/tools/")
    assert resp.status_code == 200
    tools = resp.json()
    assert any(t["id"] == tool_id for t in tools)

    # Recupera
    resp = client.get(f"/tools/{tool_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == tool_id

    # Atualiza
    resp = client.put(f"/tools/{tool_id}", json=UPDATED_PAYLOAD)
    assert resp.status_code == 200
    assert resp.json()["common_name"] == UPDATED_PAYLOAD["common_name"]

    # Remove
    resp = client.delete(f"/tools/{tool_id}")
    assert resp.status_code == 204
    # Confirma remoção
    resp = client.get(f"/tools/{tool_id}")
    assert resp.status_code == 404
