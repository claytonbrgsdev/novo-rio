from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from ..schemas.whatsapp import WhatsappMessageIn, WhatsappMessageOut
from ..services.terrain_service import update_terrain
from ..services.action_registry import registry
import os
from datetime import datetime, timedelta
from ..db import SessionLocal
from ..crud.terrain import get_terrain

PLAYER_ACTION_LIMIT = int(os.getenv('PLAYER_ACTION_LIMIT', '10'))

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

@router.post("/message", response_model=WhatsappMessageOut)
def whatsapp_message_endpoint(payload: WhatsappMessageIn, background_tasks: BackgroundTasks):
    """Stub de endpoint WhatsApp: registra ação fictícia"""
    # Se veio de WhatsApp (phone_number), sempre registra ação
    if payload.phone_number is not None:
        # Determina action_name e terrain_id
        if payload.command and payload.terrain_id:
            action_name = payload.command
            terrain_id = payload.terrain_id
        else:
            text = payload.message or ""
            tokens = text.lower().strip().split()
            action_name = tokens[0] if tokens else ""
            terrain_id = int(tokens[1]) if len(tokens) > 1 and tokens[1].isdigit() else 1
        # Checagem de ciclo 6h e limite de ações
        db = SessionLocal()
        try:
            terrain_obj = get_terrain(db, terrain_id)
            if not terrain_obj:
                raise HTTPException(status_code=404, detail="Terrain not found")
            player = terrain_obj.player
            now = datetime.now()
            if player.cycle_start + timedelta(hours=6) <= now:
                player.cycle_start = now
                player.actions_count = 0
            if player.actions_count >= PLAYER_ACTION_LIMIT:
                raise HTTPException(status_code=429, detail="Limite de ações deste ciclo atingido")
            player.actions_count += 1
            db.commit()
        finally:
            db.close()
        background_tasks.add_task(update_terrain, action_name, terrain_id)
        return WhatsappMessageOut(reply="Ação registrada com ID 1")
    # Chamadas internas: verifica handler
    if payload.command and payload.terrain_id:
        action_name = payload.command
        terrain_id = payload.terrain_id
    else:
        text = payload.message or ""
        tokens = text.lower().strip().split()
        action_name = tokens[0] if tokens else ""
        terrain_id = int(tokens[1]) if len(tokens) > 1 and tokens[1].isdigit() else 1
    if not registry.has(action_name):
        return WhatsappMessageOut(reply=f"Comando '{action_name}' não reconhecido")
    # Checagem de ciclo 6h e limite de ações
    db = SessionLocal()
    try:
        terrain_obj = get_terrain(db, terrain_id)
        if not terrain_obj:
            raise HTTPException(status_code=404, detail="Terrain not found")
        player = terrain_obj.player
        now = datetime.now()
        if player.cycle_start + timedelta(hours=6) <= now:
            player.cycle_start = now
            player.actions_count = 0
        if player.actions_count >= PLAYER_ACTION_LIMIT:
            raise HTTPException(status_code=429, detail="Limite de ações deste ciclo atingido")
        player.actions_count += 1
        db.commit()
    finally:
        db.close()
    background_tasks.add_task(update_terrain, action_name, terrain_id)
    return WhatsappMessageOut(reply="Ação registrada com ID 1")
