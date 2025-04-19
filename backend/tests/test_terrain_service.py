import pytest

from src.db import Base, engine, SessionLocal
from src.services.terrain_service import update_terrain
from src.crud.terrain_parameters import get_terrain_parameters

@ pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Cria tabelas antes dos testes
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_update_terrain_plantar():
    # Executa ação de plantar
    update_terrain("plantar")
    db = SessionLocal()
    params = get_terrain_parameters(db, terrain_id=1)
    assert params is not None, "TerrainParameters should be created"
    assert params.coverage == 10
    assert params.regeneration_cycles == 1
    db.close()

def test_update_terrain_regar():
    # Executa ação de regar (water)
    update_terrain("regar")
    db = SessionLocal()
    params = get_terrain_parameters(db, terrain_id=1)
    assert params.coverage == 10, "Coverage should remain after watering"
    assert params.regeneration_cycles == 2, "Cycles should increment on watering"
    db.close()

def test_update_terrain_colher():
    # Executa ação de colher (harvest)
    update_terrain("colher")
    db = SessionLocal()
    params = get_terrain_parameters(db, terrain_id=1)
    assert params.coverage == 0, "Coverage should decrease by 10 on harvest"
    assert params.regeneration_cycles == 2, "Cycles should remain after harvest"
    db.close()
