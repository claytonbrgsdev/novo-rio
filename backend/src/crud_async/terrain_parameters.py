from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.terrain_parameters import TerrainParameters
from ..schemas.terrain_parameters import TerrainParametersCreate, TerrainParametersUpdate
from ..services.soil_health import analyze_soil_health


async def get_terrain_parameters_async(db: AsyncSession, terrain_id: int) -> Optional[TerrainParameters]:
    """
    Obtém os parâmetros de um terreno pelo ID do terreno (versão assíncrona).
    
    Args:
        db (AsyncSession): Sessão assíncrona do banco de dados
        terrain_id (int): ID do terreno
        
    Returns:
        Optional[TerrainParameters]: Objeto de parâmetros do terreno ou None se não encontrado
    """
    result = await db.execute(
        select(TerrainParameters).where(TerrainParameters.terrain_id == terrain_id)
    )
    return result.scalars().first()


async def create_terrain_parameters_async(db: AsyncSession, params: TerrainParametersCreate) -> TerrainParameters:
    """
    Cria um novo registro de parâmetros de terreno (versão assíncrona).
    
    Args:
        db (AsyncSession): Sessão assíncrona do banco de dados
        params (TerrainParametersCreate): Dados para criação
        
    Returns:
        TerrainParameters: Objeto de parâmetros criado
    """
    db_params = TerrainParameters(**params.dict())
    db.add(db_params)
    await db.commit()
    await db.refresh(db_params)
    return db_params


async def update_terrain_parameters_async(db: AsyncSession, terrain_id: int, params_update: TerrainParametersUpdate) -> Optional[TerrainParameters]:
    """
    Atualiza os parâmetros de um terreno (versão assíncrona).
    
    Args:
        db (AsyncSession): Sessão assíncrona do banco de dados
        terrain_id (int): ID do terreno
        params_update (TerrainParametersUpdate): Dados para atualização
        
    Returns:
        Optional[TerrainParameters]: Objeto atualizado ou None se não encontrado
    """
    db_params = await get_terrain_parameters_async(db, terrain_id)
    if db_params:
        for field, value in params_update.dict(exclude_unset=True).items():
            setattr(db_params, field, value)
        await db.commit()
        await db.refresh(db_params)
    return db_params


async def get_terrain_health_report_async(db: AsyncSession, terrain_id: int) -> Dict[str, Any]:
    """
    Gera um relatório de saúde do solo para um terreno (versão assíncrona).
    
    Args:
        db (AsyncSession): Sessão assíncrona do banco de dados
        terrain_id (int): ID do terreno
        
    Returns:
        Dict[str, Any]: Relatório com índice de saúde, categoria e alertas
    """
    # Obter os parâmetros do terreno
    terrain_params = await get_terrain_parameters_async(db, terrain_id)
    if not terrain_params:
        return {
            "health_index": 0,
            "health_category": "Desconhecido",
            "alerts": [],
            "recommendations": ["Parâmetros do terreno não encontrados"]
        }
    
    # Analisar a saúde do solo
    return analyze_soil_health(terrain_params)
