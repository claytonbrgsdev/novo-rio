from fastapi import APIRouter, Depends, BackgroundTasks
from ..schemas.whatsapp import WhatsappMessageIn, WhatsappMessageOut
from ..services.terrain_service import update_terrain

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

@router.post("/message", response_model=WhatsappMessageOut)
def whatsapp_message_endpoint(payload: WhatsappMessageIn, background_tasks: BackgroundTasks):
    """Stub de endpoint WhatsApp: registra ação fictícia"""
    # Executa atualização de terreno em background
    background_tasks.add_task(update_terrain, payload.message)
    # Retorna ID fixo para teste
    return WhatsappMessageOut(reply="Ação registrada com ID 1")
