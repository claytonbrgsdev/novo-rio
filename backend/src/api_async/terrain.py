from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_async_db
from ..crud_async.terrain import (
    create_terrain_async,
    get_terrains_async,
    get_terrain_async,
    update_terrain_async,
    delete_terrain_async,
)
from ..crud_async.terrain_parameters import (
    get_terrain_parameters_async,
    get_terrain_health_report_async
)
from ..schemas.terrain import TerrainCreate, TerrainUpdate, TerrainOut
from ..schemas.soil_health import SoilHealthReport
from ..schemas.terrain_parameters import TerrainParametersWithHealthOut

router = APIRouter(prefix="/async/terrains", tags=["terrains"])

@router.post("/", response_model=TerrainOut)
async def create_terrain_async_endpoint(
    terrain: TerrainCreate, db: AsyncSession = Depends(get_async_db())
):
    return await create_terrain_async(db, terrain)

@router.get("/", response_model=List[TerrainOut])
async def list_terrains_async(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db())
):
    return await get_terrains_async(db, skip, limit)

@router.get("/{terrain_id}", response_model=TerrainOut)
async def get_terrain_async_endpoint(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    terrain = await get_terrain_async(db, terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return terrain

@router.put("/{terrain_id}", response_model=TerrainOut)
async def update_terrain_async_endpoint(
    terrain_id: int,
    terrain_update: TerrainUpdate,
    db: AsyncSession = Depends(get_async_db()),
):
    terrain = await update_terrain_async(db, terrain_id, terrain_update)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return terrain

@router.delete("/{terrain_id}", status_code=204)
async def delete_terrain_async_endpoint(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    await delete_terrain_async(db, terrain_id)
    return None

@router.get("/{terrain_id}/soil-health", response_model=SoilHealthReport,
            summary="Soil Health Index",
            description="Retorna um relatório de saúde do solo para o terreno, incluindo índice de saúde, categoria e alertas.")
async def get_soil_health_async_endpoint(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Retorna o índice de saúde do solo para um terreno."""
    # Verificar se o terreno existe
    terrain = await get_terrain_async(db, terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terreno não encontrado")
    
    # Obter o relatório de saúde do solo
    health_report = await get_terrain_health_report_async(db, terrain_id)
    return health_report

@router.get("/{terrain_id}/parameters-with-health", response_model=TerrainParametersWithHealthOut,
            summary="Terrain Parameters with Health Report",
            description="Retorna os parâmetros do terreno junto com o relatório de saúde do solo.")
async def get_terrain_params_with_health_async(
    terrain_id: int, db: AsyncSession = Depends(get_async_db())
):
    """Retorna os parâmetros do terreno junto com relatório de saúde."""
    # Verificar se o terreno existe
    terrain = await get_terrain_async(db, terrain_id)
    if not terrain:
        raise HTTPException(status_code=404, detail="Terreno não encontrado")
    
    # Obter os parâmetros do terreno
    terrain_params = await get_terrain_parameters_async(db, terrain_id)
    if not terrain_params:
        raise HTTPException(status_code=404, detail="Parâmetros do terreno não encontrados")
    
    # Obter o relatório de saúde do solo
    health_report = await get_terrain_health_report_async(db, terrain_id)
    
    # Converter para o schema de saída e adicionar o relatório de saúde
    result = TerrainParametersWithHealthOut.from_orm(terrain_params)
    result.health_report = health_report
    
    return result
