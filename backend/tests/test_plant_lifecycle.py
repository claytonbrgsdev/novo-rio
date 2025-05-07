import os
import pytest
from datetime import datetime
from src.services.plant_lifecycle import tick_day, load_species_params
from src.models import Species, Planting, PlantStateLog
from src.db import SessionLocal

@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    # acelera o tempo: 1 hora = 1 dia
    monkeypatch.setenv("TIME_SCALE_FACTOR", "24")

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    finally:
        db.rollback()
        db.close()


def seed_species(db):
    params = load_species_params("Caryocar_brasiliense")
    specie = Species(key="Caryocar_brasiliense", **params)
    db.add(specie)
    db.commit()
    return specie


def test_germination_scaled(db_session):
    specie = seed_species(db_session)
    planting = Planting(
        species_id=specie.id,
        player_id=1,
        planted_at=datetime.utcnow(),
        current_state="SEMENTE",
        days_since_planting=0,
        days_sem_rega=0
    )
    db_session.add(planting)
    db_session.commit()

    tick_day()
    db_session.refresh(planting)
    assert planting.current_state == "MUDINHA"


def test_maturity_scaled(db_session):
    specie = seed_species(db_session)
    planting = Planting(
        species_id=specie.id,
        player_id=1,
        planted_at=datetime.utcnow(),
        current_state="MUDINHA",
        days_since_planting=1,
        days_sem_rega=0
    )
    db_session.add(planting)
    db_session.commit()

    tick_day()
    tick_day()
    db_session.refresh(planting)
    assert planting.current_state in ("MADURA", "COLHÍVEL")


def test_death_by_drought(db_session):
    specie = seed_species(db_session)
    planting = Planting(
        species_id=specie.id,
        player_id=1,
        planted_at=datetime.utcnow(),
        current_state="MUDINHA",
        days_since_planting=0,
        days_sem_rega=3
    )
    db_session.add(planting)
    db_session.commit()

    tick_day()
    db_session.refresh(planting)
    assert planting.current_state == "MORTA"
