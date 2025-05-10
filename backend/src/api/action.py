from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db_override
from ..schemas.tool_use import ToolUse
from ..services.terrain_service import update_terrain
from ..crud.terrain import get_terrain

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/", response_model=dict)
def perform_action(payload: ToolUse, background_tasks: BackgroundTasks, db: Session = Depends(get_db_override)):
    # valida terreno
    terrain = get_terrain(db, payload.terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    # enfileira a ação com ferramenta (se houver)
    background_tasks.add_task(
        update_terrain,
        db,
        payload.action_name,
        payload.terrain_id,
        payload.tool_key
    )
    return {"status": "ok", "message": "Ação agendada"}