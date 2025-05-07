from typing import Dict
from fastapi import APIRouter
from ..services.plant_lifecycle import load_species_params
from ..schemas.species import SpeciesSchema

router = APIRouter(prefix="/species", tags=["species"])

@router.get("/", response_model=Dict[str, SpeciesSchema], summary="List Species", description="Retorna todos os parâmetros das espécies configuradas em species.yml")
def list_species():
    """Lista parâmetros de todas as espécies."""
    return load_species_params("src/data/species.yml")
