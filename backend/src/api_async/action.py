from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..schemas.tool_use import ToolUse
from ..services.terrain_service import update_terrain
from ..crud_async.terrain import get_terrain_async

router = APIRouter(prefix="/async/actions", tags=["actions"])

@router.post("/", response_model=dict)
async def perform_action_async(payload: ToolUse, db: AsyncSession = Depends(get_async_db())):
    # valida terreno
    terrain = await get_terrain_async(db, payload.terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    # dispara update (ainda síncrono internamente, mas enfileirado rápido)
    update_terrain(payload.action_name, payload.terrain_id, payload.tool_key)
    return {"status": "ok", "message": "Ação agendada"}