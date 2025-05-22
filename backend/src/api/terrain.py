from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db, get_async_db
from ..crud.terrain import create_terrain, get_terrain, get_terrains, update_terrain_crud, delete_terrain
from ..crud.terrain_parameters import get_terrain_parameters, get_terrain_health_report
from ..schemas.terrain import TerrainCreate, TerrainUpdate, TerrainOut
from ..schemas.soil_health import SoilHealthReport
from ..schemas.terrain_parameters import TerrainParametersWithHealthOut
from ..models.terrain import Terrain

router = APIRouter(prefix="/terrains", tags=["terrains"])

@router.post("/", response_model=TerrainOut,
             summary="Create Terrain",
             description="Creates a new terrain for a player.\n\nExample request:\n```json\n{ \"player_id\": 1, \"name\": \"Forest\", \"x_coordinate\": 1.0, \"y_coordinate\": 2.0, \"access_type\": \"pub\" }\n```")
async def create_terrain_endpoint(terrain: TerrainCreate, db: Session = Depends(get_db)):
    """Creates a new terrain record."""
    return await run_in_threadpool(create_terrain, db, terrain)

@router.get("/", response_model=List[TerrainOut],
            summary="List Terrains",
            description="Retrieves a list of terrains with pagination.")
async def list_terrains(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    """Returns a list of terrains."""
    try:
        result = await db.execute(Terrain.__table__.select().offset(skip).limit(limit))
        terrains = result.fetchall()
        return [TerrainOut.from_orm(terrain) for terrain in terrains]
    except Exception as e:
        print(f"Error fetching terrains: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch terrains: {str(e)}"
        )

@router.get("/{terrain_id}", response_model=TerrainOut,
            summary="Get Terrain",
            description="Retrieves a terrain by its ID.")
async def get_terrain_endpoint(terrain_id: int, db: AsyncSession = Depends(get_async_db)):
    """Fetches a terrain by ID."""
    try:
        result = await db.execute(Terrain.__table__.select().where(Terrain.__table__.c.id == terrain_id))
        db_terrain = result.fetchone()
        if not db_terrain:
            raise HTTPException(status_code=404, detail="Terrain not found")
        return TerrainOut.from_orm(db_terrain)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching terrain: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch terrain: {str(e)}")

@router.put("/{terrain_id}", response_model=TerrainOut,
            summary="Update Terrain",
            description="Updates terrain fields.\n\nExample request:\n```json\n{ \"name\": \"NewForest\" }\n```")
async def update_terrain_endpoint(terrain_id: int, terrain_update: TerrainUpdate, db: Session = Depends(get_db)):
    """Updates an existing terrain."""
    db_terrain = await run_in_threadpool(update_terrain_crud, db, terrain_id, terrain_update)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terrain not found")
    return db_terrain

@router.delete("/{terrain_id}", status_code=204,
               summary="Delete Terrain",
               description="Deletes a terrain by its ID.")
async def delete_terrain_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    """Deletes a terrain record."""
    await run_in_threadpool(delete_terrain, db, terrain_id)
    return None

@router.get("/{terrain_id}/soil-health", response_model=SoilHealthReport,
            summary="Soil Health Index",
            description="Retorna um relatório de saúde do solo para o terreno, incluindo índice de saúde, categoria e alertas.")
async def get_soil_health_endpoint(terrain_id: int, db: Session = Depends(get_db)):
    """Retorna o índice de saúde do solo para um terreno."""
    # Verificar se o terreno existe
    db_terrain = await run_in_threadpool(get_terrain, db, terrain_id)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terreno não encontrado")
    
    # Obter o relatório de saúde do solo
    health_report = await run_in_threadpool(get_terrain_health_report, db, terrain_id)
    return health_report

@router.get("/{terrain_id}/parameters-with-health", response_model=TerrainParametersWithHealthOut,
            summary="Terrain Parameters with Health Report",
            description="Retorna os parâmetros do terreno junto com o relatório de saúde do solo.")
async def get_terrain_params_with_health(terrain_id: int, db: Session = Depends(get_db)):
    """Retorna os parâmetros do terreno junto com relatório de saúde."""
    # Verificar se o terreno existe
    db_terrain = await run_in_threadpool(get_terrain, db, terrain_id)
    if not db_terrain:
        raise HTTPException(status_code=404, detail="Terreno não encontrado")
    
    # Obter os parâmetros do terreno
    terrain_params = await run_in_threadpool(get_terrain_parameters, db, terrain_id)
    if not terrain_params:
        raise HTTPException(status_code=404, detail="Parâmetros do terreno não encontrados")
    
    # Obter o relatório de saúde do solo
    health_report = await run_in_threadpool(get_terrain_health_report, db, terrain_id)
    
    # Converter para o schema de saída e adicionar o relatório de saúde
    result = TerrainParametersWithHealthOut.from_orm(terrain_params)
    result.health_report = health_report
    
    return result
