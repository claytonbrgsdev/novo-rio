import pytest
from src.services.action_registry import registry
from src.crud.terrain_parameters import get_terrain_parameters, create_terrain_parameters
from src.schemas.terrain_parameters import TerrainParametersCreate

@pytest.fixture(autouse=True)
def ensure_params(db_session):
    """
    Garante que exista um registro de TerrainParameters para terrain_id=1 antes de cada teste.
    """
    params_in = TerrainParametersCreate(
        terrain_id=1,
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
    create_terrain_parameters(db_session, params_in)
    yield

def test_registry_plantar(db_session):
    # apply action
    registry.handle("plantar", db_session, 1, get_errain_parameters(db_session, 1))
    params = get_terrain_parameters(db_session, 1)
    assert params.coverage == 10
    assert params.regeneration_cycles == 1

def test_registry_regar(db_session):
    # apply action
    registry.handle("regar", db_session, 1, get_terrain_parameters(db_session, 1))
    params = get_terrain_parameters(db_session, 1)
    # já havia 1 no ciclo anterior, agora deve ser 2
    assert params.regeneration_cycles == 2

def test_registry_colher(db_session):
    # apply action
    registry.handle("colher", db_session, 1, get_terrain_parameters(db_session, 1))
    params = get_terrain_parameters(db_session, 1)
    # coverage sempre volta a zero
    assert params.coverage == 0