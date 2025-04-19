"""
Serviços relacionados à lógica de evolução do terreno.
"""

from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud.terrain_parameters import get_terrain_parameters, create_terrain_parameters, update_terrain_parameters
from ..crud.climate_condition import get_climate_conditions
from ..schemas.terrain_parameters import TerrainParametersCreate, TerrainParametersUpdate
from .action_registry import registry

def update_terrain(action_name: str):
    """
    Stub de lógica de evolução do terreno.
    TODO: implementar efeitos de ação no TerrainParameters com base em action_name.
    """
    db = SessionLocal()
    try:
        terrain_id = 1  # stub
        params = get_terrain_parameters(db, terrain_id)
        if not params:
            params_in = TerrainParametersCreate(
                terrain_id=terrain_id,
                soil_moisture=0,
                fertility=0,
                soil_ph=7.0,
                organic_matter=0,
                compaction=0,
                coverage=0,
                biodiversity=0,
                regeneration_cycles=0,
                spontaneous_species_count=0,
            )
            params = create_terrain_parameters(db, params_in)
        # Handle action via registry
        registry.handle(action_name, db, terrain_id, params)
    except Exception:
        pass
    finally:
        # Efeitos de clima recentes
        try:
            ccs = get_climate_conditions(db, skip=0, limit=100)
            if ccs:
                # escolhe o mais recente por timestamp
                latest = max(ccs, key=lambda c: (c.timestamp, c.id))
                lcname = latest.name.lower()
                if lcname in ("seca", "dry"):
                    new_moisture = max((params.soil_moisture or 0) - 10, 0)
                elif lcname in ("chuva", "rain"):
                    new_moisture = (params.soil_moisture or 0) + 10
                else:
                    new_moisture = params.soil_moisture
                update_in = TerrainParametersUpdate(soil_moisture=new_moisture)
                update_terrain_parameters(db, terrain_id, update_in)
                print(f"[terrain_service] clima {latest.name}: soil_moisture {new_moisture}")
        except Exception:
            pass
        finally:
            db.close()
