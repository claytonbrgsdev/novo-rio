import pytest
from src.db import Base, engine, SessionLocal
from src.services.action_registry import registry
from src.crud.terrain_parameters import get_terrain_parameters, create_terrain_parameters
from src.schemas.terrain_parameters import TerrainParametersCreate

def test_registry_plantar():
    db = SessionLocal()
    # init params
    params_in = TerrainParametersCreate(
        terrain_id=1, soil_moisture=0, fertility=0, soil_ph=7.0,
        organic_matter=0, compaction=0, coverage=0,
        biodiversity=0, regeneration_cycles=0, spontaneous_species_count=0
    )
    create_terrain_parameters(db, params_in)
    # apply action
    registry.handle("plantar", db, 1, get_terrain_parameters(db, 1))
    params = get_terrain_parameters(db, 1)
    assert params.coverage == 10
    assert params.regeneration_cycles == 1
    db.close()


def test_registry_regar():
    db = SessionLocal()
    # ensure params exists
    params = get_terrain_parameters(db, 1)
    # apply action
    registry.handle("regar", db, 1, params)
    params = get_terrain_parameters(db, 1)
    assert params.regeneration_cycles == 2
    db.close()


def test_registry_colher():
    db = SessionLocal()
    params = get_terrain_parameters(db, 1)
    registry.handle("colher", db, 1, params)
    params = get_terrain_parameters(db, 1)
    assert params.coverage == 0
    db.close()
