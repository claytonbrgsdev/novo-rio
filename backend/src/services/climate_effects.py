"""
Serviço para aplicação de efeitos climáticos nos parâmetros do solo.
"""
import logging
import random
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Tuple

from ..models.climate_condition import ClimateCondition
from ..models.terrain_parameters import TerrainParameters
from ..models.quadrant import Quadrant
from ..schemas.climate_condition import ClimateConditionCreate

logger = logging.getLogger(__name__)

# Tipos de condições climáticas
CLIMATE_CONDITIONS = {
    "chuva_leve": {
        "description": "Chuva leve caindo sobre a região",
        "probability": 0.25,  # 25% de chance por ciclo
        "effects": {
            "soil_moisture": {"change": 5.0, "type": "increase"},
        }
    },
    "chuva_forte": {
        "description": "Fortes chuvas atingindo a região",
        "probability": 0.1,   # 10% de chance por ciclo
        "effects": {
            "soil_moisture": {"change": 12.0, "type": "increase"},
            "fertility": {"change": 1, "type": "decrease"},  # Leve lixiviação
        }
    },
    "seca": {
        "description": "Período de seca na região",
        "probability": 0.15,  # 15% de chance por ciclo
        "effects": {
            "soil_moisture": {"change": 10.0, "type": "decrease"},
            "biodiversity": {"change": 2, "type": "decrease"},
        }
    },
    "calor_intenso": {
        "description": "Onda de calor atingindo a região",
        "probability": 0.12,  # 12% de chance por ciclo
        "effects": {
            "soil_moisture": {"change": 8.0, "type": "decrease"},
            "organic_matter": {"change": 1, "type": "decrease"},
        }
    },
    "clima_ameno": {
        "description": "Clima agradável e ameno na região",
        "probability": 0.3,   # 30% de chance por ciclo
        "effects": {
            "biodiversity": {"change": 1, "type": "increase"},
        }
    },
    "neblina": {
        "description": "Neblina cobrindo a região",
        "probability": 0.08,  # 8% de chance por ciclo
        "effects": {
            "soil_moisture": {"change": 2.0, "type": "increase"},
        }
    },
}

def generate_random_climate_event() -> Optional[str]:
    """
    Gera um evento climático aleatório com base nas probabilidades definidas.
    
    Returns:
        Optional[str]: Nome do evento gerado ou None se nenhum evento ocorrer
    """
    # Verificar se algum evento ocorre
    event_occurs = random.random() < 0.6  # 60% de chance de algum evento
    
    if not event_occurs:
        return None
    
    # Eventos e suas probabilidades
    events = list(CLIMATE_CONDITIONS.keys())
    probabilities = [CLIMATE_CONDITIONS[e]["probability"] for e in events]
    
    # Normaliza as probabilidades para somarem 1
    total_prob = sum(probabilities)
    normalized_probs = [p/total_prob for p in probabilities]
    
    # Seleciona um evento com base nas probabilidades
    return random.choices(events, weights=normalized_probs, k=1)[0]

def register_climate_condition(db: Session, condition_name: str) -> ClimateCondition:
    """
    Registra uma condição climática no banco de dados.
    
    Args:
        db (Session): Sessão do banco de dados
        condition_name (str): Nome da condição climática
        
    Returns:
        ClimateCondition: Objeto da condição climática criada
    """
    condition_data = ClimateConditionCreate(
        name=condition_name,
        description=CLIMATE_CONDITIONS[condition_name]["description"]
    )
    
    # Criar o registro
    db_condition = ClimateCondition(
        name=condition_data.name,
        description=condition_data.description
    )
    db.add(db_condition)
    db.commit()
    db.refresh(db_condition)
    
    return db_condition

def apply_climate_effects(db: Session, condition_name: str) -> Dict[str, int]:
    """
    Aplica os efeitos da condição climática a todos os terrenos e quadrantes.
    
    Args:
        db (Session): Sessão do banco de dados
        condition_name (str): Nome da condição climática
        
    Returns:
        Dict[str, int]: Contadores de terrenos e quadrantes atualizados
    """
    if condition_name not in CLIMATE_CONDITIONS:
        logger.error(f"Condição climática desconhecida: {condition_name}")
        return {"terrains_updated": 0, "quadrants_updated": 0}
    
    effects = CLIMATE_CONDITIONS[condition_name]["effects"]
    logger.info(f"Aplicando efeitos de '{condition_name}' aos terrenos e quadrantes")
    
    # Contadores para logging
    counters = {
        "terrains_updated": 0,
        "quadrants_updated": 0
    }
    
    # 1. Atualizar parâmetros dos terrenos
    terrains_params = db.query(TerrainParameters).all()
    for terrain_param in terrains_params:
        # Aplicar efeitos em cada parâmetro
        updated = False
        
        for param_name, effect in effects.items():
            if hasattr(terrain_param, param_name):
                change = effect["change"]
                current_value = getattr(terrain_param, param_name)
                
                if effect["type"] == "increase":
                    new_value = current_value + change
                else:  # decrease
                    new_value = max(current_value - change, 0)
                
                setattr(terrain_param, param_name, new_value)
                updated = True
        
        if updated:
            counters["terrains_updated"] += 1
    
    # 2. Atualizar parâmetros dos quadrantes
    quadrants = db.query(Quadrant).all()
    for quadrant in quadrants:
        # Aplicar efeitos em cada parâmetro
        updated = False
        
        for param_name, effect in effects.items():
            if hasattr(quadrant, param_name):
                change = effect["change"]
                current_value = getattr(quadrant, param_name)
                
                if effect["type"] == "increase":
                    new_value = current_value + change
                else:  # decrease
                    new_value = max(current_value - change, 0)
                
                setattr(quadrant, param_name, new_value)
                updated = True
        
        if updated:
            counters["quadrants_updated"] += 1
    
    # Commit das alterações
    db.commit()
    
    logger.info(f"Efeitos de '{condition_name}' aplicados: {counters['terrains_updated']} terrenos e {counters['quadrants_updated']} quadrantes atualizados")
    return counters

def process_random_climate_event(db: Session) -> Tuple[Optional[str], Dict[str, int]]:
    """
    Gera e processa um evento climático aleatório, aplicando seus efeitos.
    
    Args:
        db (Session): Sessão do banco de dados
    
    Returns:
        Tuple[Optional[str], Dict[str, int]]: Nome do evento e contadores de atualizações
    """
    event_name = generate_random_climate_event()
    
    if not event_name:
        logger.info("Nenhum evento climático gerado neste ciclo")
        return None, {"terrains_updated": 0, "quadrants_updated": 0}
    
    # Registrar a condição climática
    register_climate_condition(db, event_name)
    
    # Aplicar os efeitos
    counters = apply_climate_effects(db, event_name)
    
    return event_name, counters
