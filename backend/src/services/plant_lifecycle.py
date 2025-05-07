"""
Serviços relacionados à lógica diária de evolução das plantas.
"""
import os
import yaml
import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import Planting, PlantStateLog, Action

logger = logging.getLogger(__name__)

# Caminho para species.yml (hot-reload)
_data_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), os.pardir, 'data', 'species.yml')
)

def load_species_params(file_path: str = None) -> dict:
    """Lê species.yml do disco e aplica fator de escala de tempo."""
    path = file_path or _data_path
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}
    except Exception as e:
        logger.error(f"Falha ao recarregar species.yml: {e}")
        return {}
    # Aplica fator de escala
    factor = float(os.getenv("TIME_SCALE_FACTOR", "1"))
    for key, params in data.items():
        params["germinacao_dias_scaled"] = params.get("germinacao_dias", 0) / factor
        params["maturidade_dias_scaled"] = params.get("maturidade_dias", 0) / factor
    logger.info("species.yml recarregado")
    return data

# Mapeia tolerância de seca para dias
TOLERANCE_LIMITS = {'alta': 7, 'media': 4, 'baixa': 2}


def tick_day():
    """
    Executa um tick diário: incrementa dias, checa rega, faz transições de estado e grava logs.
    """
    db: Session = SessionLocal()
    try:
        # Hot-reload de species.yml antes do ciclo
        species_params = load_species_params("src/data/species.yml")

        # Plantios não finalizados
        ativos = db.query(Planting).filter(
            ~Planting.current_state.in_(['COLHIDA', 'MORTA'])
        ).all()

        now = datetime.now()
        cutoff = now - timedelta(days=1)

        for p in ativos:
            # Incrementa dias desde plantio
            p.days_since_planting = (p.days_since_planting or 0) + 1
            # Verifica ações de rega nas últimas 24h
            cnt = db.query(Action).filter(
                Action.action_name == 'water',
                Action.player_id == p.player_id,
                Action.timestamp >= cutoff
            ).count()
            p.days_sem_rega = 0 if cnt > 0 else (p.days_sem_rega or 0) + 1

            # Limite de tolerância de seca
            params = species_params.get(p.species.key, {})
            tol = params.get('tolerancia_seca')
            limit = TOLERANCE_LIMITS.get(tol, 0)
            if p.days_sem_rega > limit:
                old = p.current_state
                p.current_state = 'MORTA'
                db.add(PlantStateLog(planting_id=p.id, from_state=old, to_state='MORTA'))
                continue

            # Transições baseadas em dias desde plantio
            if p.current_state == 'SEMENTE':
                gd = params.get('germinacao_dias_scaled', params.get('germinacao_dias'))
                if gd and p.days_since_planting >= gd:
                    old = p.current_state
                    p.current_state = 'MUDINHA'
                    db.add(PlantStateLog(planting_id=p.id, from_state=old, to_state='MUDINHA'))
            elif p.current_state == 'MUDINHA':
                md = params.get('maturidade_dias_scaled', params.get('maturidade_dias'))
                if md and p.days_since_planting >= md:
                    old = p.current_state
                    p.current_state = 'MADURA'
                    db.add(PlantStateLog(planting_id=p.id, from_state=old, to_state='MADURA'))

            # MADURA → COLHÍVEL
            if p.current_state == 'MADURA':
                old = p.current_state
                p.current_state = 'COLHIVEL'
                db.add(PlantStateLog(planting_id=p.id, from_state=old, to_state='COLHIVEL'))

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro em tick_day: {e}")
    finally:
        db.close()
