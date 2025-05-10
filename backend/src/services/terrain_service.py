"""
Serviços relacionados à lógica de evolução do terreno.
"""

import time
import logging
from sqlalchemy.orm import Session

from ..crud.terrain_parameters import (
    get_terrain_parameters,
    create_terrain_parameters,
    update_terrain_parameters,
)
from ..crud.climate_condition import get_climate_conditions
from ..schemas.terrain_parameters import TerrainParametersCreate, TerrainParametersUpdate
from .action_registry import registry

logger = logging.getLogger(__name__)

def update_terrain(db: Session, action_name: str, terrain_id: int = 1, tool_key: str = None):
    """
    Lógica de evolução do terreno com retry e fallback.
    Pode receber tool_key opcional para aplicar efeitos de ferramenta.
    """
    try:
        success = False
        for attempt in range(3):
            try:
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

                # Handle action via registry, passando tool_key
                registry.handle(action_name, db, terrain_id, params, tool_key)

                success = True
                break
            except Exception as e:
                logger.warning(
                    f"Attempt {attempt+1} failed for '{action_name}' on terrain {terrain_id}: {e}"
                )
                time.sleep(1)

        if not success:
            logger.error(
                f"Action '{action_name}' failed after 3 attempts on terrain {terrain_id}"
            )
            return
    except Exception:
        pass
    finally:
        # Efeitos de clima recentes
        try:
            ccs = get_climate_conditions(db, skip=0, limit=100)
            if ccs:
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