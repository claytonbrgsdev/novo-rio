"""
Serviço responsável pela deterioração natural dos parâmetros do solo ao longo do tempo.
"""
import logging
from sqlalchemy.orm import Session
from typing import List, Dict

from ..models.terrain_parameters import TerrainParameters
from ..models.quadrant import Quadrant
from ..schemas.terrain_parameters import TerrainParametersUpdate
from .seasonality import get_season_adjusted_deterioration_factors
from .quadrant_neighbors import propagate_effect_to_neighbors

logger = logging.getLogger(__name__)

# Fatores de deterioração diária para cada parâmetro (valores em %)
DAILY_DETERIORATION_FACTORS = {
    "soil_moisture": 2.5,     # Perda diária de 2.5% da umidade
    "organic_matter": 0.8,    # Perda diária de 0.8% da matéria orgânica
    "biodiversity": 0.5,      # Perda diária de 0.5% da biodiversidade
}

# Limites mínimos de cada parâmetro após deterioração
MIN_VALUES = {
    "soil_moisture": 5.0,     # A umidade natural não cai abaixo de 5%
    "organic_matter": 3,      # A matéria orgânica não cai abaixo de 3
    "biodiversity": 2,        # A biodiversidade não cai abaixo de 2
}

def apply_daily_deterioration(db: Session) -> Dict[str, int]:
    """
    Aplica a deterioração diária a todos os terrenos e quadrantes.
    
    Args:
        db (Session): Sessão do banco de dados
        
    Returns:
        Dict[str, int]: Contadores de terrenos e quadrantes atualizados
    """
    logger.info("Iniciando processo de deterioração natural diária")
    
    # Obter fatores de deterioração ajustados à estação atual
    adjusted_factors = get_season_adjusted_deterioration_factors(db)
    logger.info(f"Fatores de deterioração ajustados pela estação: {adjusted_factors}")
    
    # Contadores para logging
    counters = {
        "terrains_updated": 0,
        "quadrants_updated": 0,
        "propagation_updates": 0
    }
    
    # 1. Atualizar parâmetros dos terrenos
    terrains_params = db.query(TerrainParameters).all()
    for terrain_param in terrains_params:
        # Aplicar deterioração em cada parâmetro
        updated = False
        
        # Umidade do solo
        if terrain_param.soil_moisture > MIN_VALUES["soil_moisture"]:
            decrease = terrain_param.soil_moisture * (adjusted_factors["soil_moisture"] / 100)
            terrain_param.soil_moisture = max(
                terrain_param.soil_moisture - decrease, 
                MIN_VALUES["soil_moisture"]
            )
            updated = True
        
        # Matéria orgânica
        if terrain_param.organic_matter > MIN_VALUES["organic_matter"]:
            decrease = terrain_param.organic_matter * (adjusted_factors["organic_matter"] / 100)
            terrain_param.organic_matter = max(
                int(terrain_param.organic_matter - decrease), 
                MIN_VALUES["organic_matter"]
            )
            updated = True
            
        # Biodiversidade
        if terrain_param.biodiversity > MIN_VALUES["biodiversity"]:
            decrease = terrain_param.biodiversity * (adjusted_factors["biodiversity"] / 100)
            terrain_param.biodiversity = max(
                int(terrain_param.biodiversity - decrease),
                MIN_VALUES["biodiversity"]
            )
            updated = True
            
        if updated:
            counters["terrains_updated"] += 1
    
    # 2. Atualizar parâmetros dos quadrantes
    quadrants = db.query(Quadrant).all()
    for quadrant in quadrants:
        # Aplicar deterioração em cada parâmetro
        updated = False
        
        # Umidade do solo
        if quadrant.soil_moisture > MIN_VALUES["soil_moisture"]:
            decrease = quadrant.soil_moisture * (adjusted_factors["soil_moisture"] / 100)
            original = quadrant.soil_moisture
            quadrant.soil_moisture = max(
                quadrant.soil_moisture - decrease, 
                MIN_VALUES["soil_moisture"]
            )
            updated = True
        
        # Matéria orgânica
        if quadrant.organic_matter > MIN_VALUES["organic_matter"]:
            decrease = quadrant.organic_matter * (adjusted_factors["organic_matter"] / 100)
            original = quadrant.organic_matter
            quadrant.organic_matter = max(
                int(quadrant.organic_matter - decrease), 
                MIN_VALUES["organic_matter"]
            )
            updated = True
            
        # Biodiversidade
        if quadrant.biodiversity > MIN_VALUES["biodiversity"]:
            decrease = quadrant.biodiversity * (adjusted_factors["biodiversity"] / 100)
            original = quadrant.biodiversity
            quadrant.biodiversity = max(
                int(quadrant.biodiversity - decrease),
                MIN_VALUES["biodiversity"]
            )
            updated = True
            
        if updated:
            counters["quadrants_updated"] += 1
            
            # Propagar deterioração para quadrantes vizinhos
            effect_delta = {
                "soil_moisture": -decrease if "soil_moisture" in adjusted_factors else 0,
                "organic_matter": -int(decrease) if "organic_matter" in adjusted_factors else 0,
                "biodiversity": -int(decrease) if "biodiversity" in adjusted_factors else 0
            }
            
            # Remover efeitos zerados
            effect_delta = {k: v for k, v in effect_delta.items() if v != 0}
            
            if effect_delta:
                propagation_result = propagate_effect_to_neighbors(db, quadrant, effect_delta)
                counters["propagation_updates"] += propagation_result["quadrants_updated"]
    
    # Commit das alterações
    db.commit()
    
    logger.info(f"Deterioração natural aplicada: {counters['terrains_updated']} terrenos, {counters['quadrants_updated']} quadrantes diretos e {counters['propagation_updates']} por propagação")
    return counters
