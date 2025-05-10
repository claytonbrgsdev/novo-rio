"""
Serviço para gerenciar a sazonalidade do sistema agrícola.
"""
import logging
import random
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import func

from ..models.season import Season, SeasonType
from ..schemas.season import SeasonCreate
from ..services.soil_deterioration import DAILY_DETERIORATION_FACTORS

logger = logging.getLogger(__name__)

# Duração padrão de cada estação em dias
SEASON_DURATION_DAYS = 28  # Aproximadamente um mês por estação

# Configuração padrão das estações
SEASON_CONFIGS = {
    SeasonType.VERAO: {
        "description": "Período quente e seco. Aumento da evaporação de água.",
        "soil_moisture_factor": 1.5,    # 50% mais perda de umidade no verão
        "organic_matter_factor": 1.2,   # 20% mais decomposição de matéria orgânica
        "biodiversity_factor": 1.1,     # 10% mais perda de biodiversidade
        "fertility_factor": 0.9,        # 10% menos perda de fertilidade
        "germination_factor": 0.85,     # Germinação 15% mais rápida
        "maturation_factor": 0.8,       # Maturação 20% mais rápida
    },
    SeasonType.OUTONO: {
        "description": "Temperaturas amenas com aumento gradual de precipitação.",
        "soil_moisture_factor": 0.9,    # 10% menos perda de umidade
        "organic_matter_factor": 1.3,   # 30% mais decomposição (folhas caindo)
        "biodiversity_factor": 0.9,     # 10% menos perda de biodiversidade
        "fertility_factor": 1.1,        # 10% mais perda de fertilidade
        "germination_factor": 1.05,     # Germinação 5% mais lenta
        "maturation_factor": 1.1,       # Maturação 10% mais lenta
    },
    SeasonType.INVERNO: {
        "description": "Período mais frio e úmido. Redução no metabolismo vegetal.",
        "soil_moisture_factor": 0.7,    # 30% menos perda de umidade
        "organic_matter_factor": 0.8,   # 20% menos decomposição
        "biodiversity_factor": 1.2,     # 20% mais perda de biodiversidade
        "fertility_factor": 1.0,        # Sem alteração na fertilidade
        "germination_factor": 1.3,      # Germinação 30% mais lenta
        "maturation_factor": 1.4,       # Maturação 40% mais lenta
    },
    SeasonType.PRIMAVERA: {
        "description": "Período de renovação e crescimento. Condições ideais para plantas.",
        "soil_moisture_factor": 1.0,    # Perda padrão de umidade
        "organic_matter_factor": 1.0,   # Decomposição padrão
        "biodiversity_factor": 0.7,     # 30% menos perda de biodiversidade
        "fertility_factor": 0.8,        # 20% menos perda de fertilidade
        "germination_factor": 0.9,      # Germinação 10% mais rápida
        "maturation_factor": 0.95,      # Maturação 5% mais rápida
    }
}

async def get_current_season_async(db: Session) -> Optional[Season]:
    """
    Obtém a estação atual do sistema (versão assíncrona).
    
    Args:
        db (Session): Sessão do banco de dados
        
    Returns:
        Optional[Season]: A estação atual ou None se não houver
    """
    result = await db.execute(
        select(Season).order_by(Season.start_date.desc()).limit(1)
    )
    return result.scalars().first()

def get_current_season(db: Session) -> Optional[Season]:
    """
    Obtém a estação atual do sistema (versão síncrona).
    
    Args:
        db (Session): Sessão do banco de dados
        
    Returns:
        Optional[Season]: A estação atual ou None se não houver
    """
    return db.query(Season).order_by(Season.start_date.desc()).first()

def create_new_season(db: Session, season_type: SeasonType) -> Season:
    """
    Cria uma nova estação no sistema.
    
    Args:
        db (Session): Sessão do banco de dados
        season_type (SeasonType): O tipo da estação a ser criada
        
    Returns:
        Season: A nova estação criada
    """
    config = SEASON_CONFIGS[season_type]
    
    season_data = SeasonCreate(
        name=season_type,
        description=config["description"],
        soil_moisture_factor=config["soil_moisture_factor"],
        organic_matter_factor=config["organic_matter_factor"],
        biodiversity_factor=config["biodiversity_factor"],
        fertility_factor=config["fertility_factor"],
        germination_factor=config["germination_factor"],
        maturation_factor=config["maturation_factor"]
    )
    
    db_season = Season(
        name=season_data.name,
        description=season_data.description,
        soil_moisture_factor=season_data.soil_moisture_factor,
        organic_matter_factor=season_data.organic_matter_factor,
        biodiversity_factor=season_data.biodiversity_factor,
        fertility_factor=season_data.fertility_factor,
        germination_factor=season_data.germination_factor,
        maturation_factor=season_data.maturation_factor
    )
    
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    
    logger.info(f"Nova estação criada: {season_type}")
    return db_season

def get_next_season_type(current_season_type: SeasonType) -> SeasonType:
    """
    Determina a próxima estação no ciclo sazonal.
    
    Args:
        current_season_type (SeasonType): A estação atual
        
    Returns:
        SeasonType: A próxima estação no ciclo
    """
    seasons_cycle = [
        SeasonType.VERAO,
        SeasonType.OUTONO,
        SeasonType.INVERNO,
        SeasonType.PRIMAVERA
    ]
    
    current_index = seasons_cycle.index(current_season_type)
    next_index = (current_index + 1) % len(seasons_cycle)
    
    return seasons_cycle[next_index]

def check_and_update_season(db: Session) -> Optional[Season]:
    """
    Verifica se é necessário mudar de estação e faz a transição se for o caso.
    
    Args:
        db (Session): Sessão do banco de dados
        
    Returns:
        Optional[Season]: A nova estação se houve mudança, ou None se não houve
    """
    current_season = get_current_season(db)
    
    # Se não houver estação, criar verão como estação inicial
    if not current_season:
        return create_new_season(db, SeasonType.VERAO)
    
    # Calcular se já passou o período da estação atual
    days_elapsed = (datetime.utcnow() - current_season.start_date).days
    
    if days_elapsed >= SEASON_DURATION_DAYS:
        # Tempo suficiente se passou, transicionar para próxima estação
        next_season_type = get_next_season_type(current_season.name)
        return create_new_season(db, next_season_type)
    
    return None

def get_season_adjusted_deterioration_factors(db: Session) -> Dict[str, float]:
    """
    Obtém os fatores de deterioração ajustados pela estação atual.
    
    Args:
        db (Session): Sessão do banco de dados
        
    Returns:
        Dict[str, float]: Fatores de deterioração ajustados
    """
    current_season = get_current_season(db)
    
    # Se não houver estação, usar fatores padrão
    if not current_season:
        return DAILY_DETERIORATION_FACTORS.copy()
    
    # Aplicar os multiplicadores da estação aos fatores base
    adjusted_factors = {}
    
    adjusted_factors["soil_moisture"] = DAILY_DETERIORATION_FACTORS["soil_moisture"] * current_season.soil_moisture_factor
    adjusted_factors["organic_matter"] = DAILY_DETERIORATION_FACTORS["organic_matter"] * current_season.organic_matter_factor
    adjusted_factors["biodiversity"] = DAILY_DETERIORATION_FACTORS["biodiversity"] * current_season.biodiversity_factor
    
    logger.debug(f"Fatores de deterioração ajustados pela estação {current_season.name}: {adjusted_factors}")
    return adjusted_factors
