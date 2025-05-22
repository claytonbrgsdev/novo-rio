import os
from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from ..services.plant_lifecycle import load_species_params
from ..schemas.species import SpeciesSchema, SpeciesBase
from ..db import get_db, get_async_db
from ..models.species import Species

router = APIRouter(prefix="/species", tags=["species"])

@router.get("/", response_model=Dict[str, Dict[str, Any]], summary="List Species", description="Retorna todos os parâmetros das espécies configuradas em species.yml")
async def list_species():
    """Lista parâmetros de todas as espécies do arquivo YAML."""
    try:
        # Verificar se o arquivo existe
        yaml_path = "src/data/species.yml"
        if not os.path.exists(yaml_path):
            # Retornar um dicionário vazio, não um erro 500
            return {}
            
        species_data = load_species_params(yaml_path)
        # Adicionar ID para cada espécie para satisfazer o esquema
        for i, (key, species) in enumerate(species_data.items()):
            species['id'] = i + 1
        return species_data
    except Exception as e:
        print(f"Error loading species params: {str(e)}")
        # Retornar um dicionário vazio em vez de 500
        return {}

@router.get("/db", response_model=List[dict], summary="List Species from Database", 
           description="Retorna todas as espécies cadastradas no banco de dados")
async def list_species_from_db(db: AsyncSession = Depends(get_async_db)):
    """Lista espécies do banco de dados."""
    try:
        result = await db.execute(Species.__table__.select())
        species = result.fetchall()
        # Converter para dicionário para facilitar serialização
        result = [
            {
                "id": s.id,
                "key": s.key,
                "common_name": s.common_name,
                "germinacao_dias": s.germinacao_dias,
                "maturidade_dias": s.maturidade_dias,
                "agua_diaria_min": s.agua_diaria_min,
                "espaco_m2": s.espaco_m2,
                "rendimento_unid": s.rendimento_unid,
                "tolerancia_seca": s.tolerancia_seca
            }
            for s in species
        ]
        return result
    except Exception as e:
        print(f"Error fetching species from database: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch species from database: {str(e)}"
        )
        # Retornar lista vazia em vez de 500
        return []
