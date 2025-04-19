from fastapi import APIRouter, Depends, BackgroundTasks
from ..schemas.whatsapp import WhatsappMessageIn, WhatsappMessageOut
from ..services.terrain_service import update_terrain
from ..services.action_registry import registry

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

@router.post("/message", response_model=WhatsappMessageOut)
def whatsapp_message_endpoint(payload: WhatsappMessageIn, background_tasks: BackgroundTasks):
    """Stub de endpoint WhatsApp: registra ação fictícia"""
    # Determina action_name e terrain_id
    if payload.command and payload.terrain_id:
        action_name = payload.command
        terrain_id = payload.terrain_id
    else:
        # Processa mensagem livre: extrai comando e id do terreno
        text = payload.message or ""
        tokens = text.lower().strip().split()
        action_name = tokens[0] if tokens else ""
        terrain_id = int(tokens[1]) if len(tokens) > 1 and tokens[1].isdigit() else 1
    # Verifica handler antes de agendar
    if not registry.has(action_name):
        return WhatsappMessageOut(reply=f"Comando '{action_name}' não reconhecido")
    # Executa atualização de terreno em background
    background_tasks.add_task(update_terrain, action_name, terrain_id)
    # Retorna ID fixo para teste
    return WhatsappMessageOut(reply="Ação registrada com ID 1")
