import pytest
from fastapi.testclient import TestClient
import httpx
import redis.asyncio as redis
import src.api.eko as eko_module
from src.main import app

class FakeResponse:
    def __init__(self, data):
        self._data = data
    def raise_for_status(self):
        pass
    def json(self):
        return self._data

captured = {"jsons": []}

@pytest.fixture(autouse=True)
def mock_httpx(monkeypatch):
    # Reset captured JSONs for each test
    captured["jsons"].clear()
    """
    Mock httpx.AsyncClient.post to return a fake response with a predefined JSON.
    """
    fake_json = {"choices": [{"message": {"role": "eko", "content": "Hello"}}]}

    async def fake_post(self, url, json):
        captured["jsons"].append(json)
        return FakeResponse(fake_json)

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    # Reset Redis client and mock aioredis connection
    eko_module.redis_client = None
    class FakeRedis:
        def __init__(self):
            self.store = {}
        async def lrange(self, key, start, end):
            return self.store.get(key, [])
        async def rpush(self, key, value):
            self.store.setdefault(key, []).append(value)
        async def delete(self, key):
            self.store.pop(key, None)
    async def fake_from_url(url, encoding, decode_responses):
        return FakeRedis()
    monkeypatch.setattr(redis, "from_url", fake_from_url)

@pytest.fixture
def client():
    return TestClient(app)

def test_eko_chat(client):
    payload = {
        "model": "test",
        "messages": [{"role": "player", "content": "Oi"}],
        "stream": False
    }
    response = client.post("/eko/", json=payload)
    assert response.status_code == 200
    assert response.json() == {"choices": [{"message": {"role": "eko", "content": "Hello"}}]}
    # Ensure one payload was captured for initial chat
    assert len(captured["jsons"]) == 1
    assert captured["jsons"][0]["messages"] == payload["messages"]

def test_conversation_context(client):
    # First message in conversation
    conv_id = "conv1"
    payload1 = {"model": "test", "messages": [{"role": "player", "content": "first"}], "stream": False, "conversation_id": conv_id}
    response1 = client.post("/eko/", json=payload1)
    assert response1.status_code == 200
    # Second message with same conversation_id
    payload2 = {"model": "test", "messages": [{"role": "player", "content": "second"}], "stream": False, "conversation_id": conv_id}
    response2 = client.post("/eko/", json=payload2)
    assert response2.status_code == 200
    # Check payloads include accumulated context
    assert len(captured["jsons"]) == 2
    # First call contains only first message
    assert captured["jsons"][0]["messages"] == payload1["messages"]
    # Second call contains both messages
    assert captured["jsons"][1]["messages"] == payload1["messages"] + payload2["messages"]

def test_clear_context(client):
    conv_id = "to_clear"
    payload = {"model": "test", "messages": [{"role": "player", "content": "test"}], "stream": False, "conversation_id": conv_id}
    # Seed the conversation context
    response1 = client.post("/eko/", json=payload)
    assert response1.status_code == 200
    # Clear context
    response = client.delete(f"/eko/{conv_id}")
    assert response.status_code == 200
    assert response.json() == {"status": "cleared"}

def test_eko_timeout(client, monkeypatch):
    # Simulate a timeout from the LLM service
    async def timeout_post(self, url, json):
        raise httpx.TimeoutException("timeout")
    monkeypatch.setattr(httpx.AsyncClient, "post", timeout_post)
    payload = {"model": "test", "messages": [{"role": "player", "content": "hey"}], "stream": False}
    response = client.post("/eko/", json=payload)
    assert response.status_code == 200
    assert response.json() == {"choices": [{"message": {"role": "eko", "content": "Serviço LLM indisponível. Tente novamente mais tarde."}}]}
