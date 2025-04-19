def test_whatsapp_endpoint(client):
    payload = {"phone_number": "5511999999999", "message": "teste-acao"}
    response = client.post("/whatsapp/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    # Deve confirmar que a ação foi registrada com um ID numérico
    assert data["reply"].startswith("Ação registrada com ID")
