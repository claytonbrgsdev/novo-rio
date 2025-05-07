from fastapi import APIRouter
from ..services.plant_lifecycle import tick_day

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/run-tick", summary="Executa um tick manual para plantas")
def run_tick():
    """Executa manualmente o tick de plantas."""
    tick_day()
    return {"status": "ok"}
