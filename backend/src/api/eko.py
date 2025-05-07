from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import httpx
import sentry_sdk
import redis.asyncio as redis
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/eko", tags=["eko"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    # Model name overrideable via environment variable
    model: str = os.getenv("LLM_MODEL", "llama3.1:8b")
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None
    stream: bool = False

class ChatChoice(BaseModel):
    message: ChatMessage

class ChatResponse(BaseModel):
    choices: List[ChatChoice]

# Redis-backed conversation persistence
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost")
redis_client = None

@router.post("/", response_model=ChatResponse,
             summary="Proxy de chat Eko",
             description="""Recebe mensagens, adiciona contexto de conversa via Redis e encaminha para o LLM.
Exemplo de payload:
```json
{ "model": "test", "messages": [{ "role": "player", "content": "Oi" }], "stream": false, "conversation_id": "conv1" }
```
Exemplo de resposta:
```json
{ "choices": [{ "message": { "role": "eko", "content": "Hello" } }] }
```""")
async def chat_proxy(request: ChatRequest):
    """Endpoint que processa chat Eko incluindo contexto Redis."""
    # Prepare conversation context using Redis
    global redis_client
    if request.conversation_id:
        if redis_client is None:
            redis_client = await redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        key = f"eko:conv:{request.conversation_id}"
        history_jsons = await redis_client.lrange(key, 0, -1)
        # Filtrar histórico para incluir apenas mensagens do usuário
        history = []
        for raw in history_jsons:
            cm = ChatMessage.parse_raw(raw)
            if cm.role != 'eko':
                history.append(cm)
        messages_to_send = history + request.messages
    else:
        messages_to_send = request.messages

    # Build request payload with context
    req = request.dict()
    req["messages"] = [m.dict() for m in messages_to_send]
    ollama_url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{ollama_url}/v1/chat/completions", json=req)
            resp.raise_for_status()
            data = resp.json()
            # Log prompt and response
            sentry_sdk.capture_message(f"Prompt: {request.messages}; Response: {data}")
            # Update Redis store with this interaction
            if request.conversation_id:
                key = f"eko:conv:{request.conversation_id}"
                # Append user messages
                for m in request.messages:
                    await redis_client.rpush(key, m.json())
                # Append assistant response
                assistant_msg = ChatMessage(
                    role=data["choices"][0]["message"]["role"],
                    content=data["choices"][0]["message"]["content"],
                )
                await redis_client.rpush(key, assistant_msg.json())
            return data
    except httpx.TimeoutException as e:
        sentry_sdk.capture_exception(e)
        # Fallback response on timeout
        return {"choices": [{"message": {"role": "eko", "content": "Serviço LLM indisponível. Tente novamente mais tarde."}}]}
    except httpx.HTTPError as e:
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=502, detail=str(e))

@router.delete("/{conversation_id}",
               summary="Limpar contexto de conversa",
               description="Deleta todo o histórico de conversa no Redis para o conversation_id especificado.\n\nExemplo de uso:\nDELETE /eko/conv1\nResposta:\n{ \"status\": \"cleared\" }")
async def clear_context(conversation_id: str):
    """Limpa histórico de conversa para conversation_id."""
    global redis_client
    # Initialize Redis client if needed
    if redis_client is None:
        redis_client = await redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    key = f"eko:conv:{conversation_id}"
    # Delete the conversation history
    await redis_client.delete(key)
    return {"status": "cleared"}
