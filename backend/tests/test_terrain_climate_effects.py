import pytest
from src.services.terrain_service import update_terrain
from src.db import Base, engine, SessionLocal
from src.crud.climate_condition import create_climate_condition
from src.schemas.climate_condition import ClimateConditionCreate
from src.crud.terrain_parameters import get_terrain_parameters

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Schema setup
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_rain_increases_moisture():
    db = SessionLocal()
    cc = ClimateConditionCreate(name="chuva", description="Chuva forte")
    create_climate_condition(db, cc)
    db.close()

    update_terrain("plantar")
    db = SessionLocal()
    params = get_terrain_parameters(db, terrain_id=1)
    assert params.soil_moisture == 10
    db.close()


def test_dry_decreases_moisture():
    db = SessionLocal()
    cc = ClimateConditionCreate(name="seca", description="Seca intensa")
    create_climate_condition(db, cc)
    db.close()

    update_terrain("plantar")
    db = SessionLocal()
    params = get_terrain_parameters(db, terrain_id=1)
    assert params.soil_moisture == 0
    db.close()
