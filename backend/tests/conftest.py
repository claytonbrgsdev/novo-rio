import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.db import Base, engine
import src.models  # ensure models are registered

@pytest.fixture(scope="session", autouse=True)
def create_tables():
    # Ensure DB schema is created
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    from src.scripts.seed import seed_players, seed_terrains
    seed_players()
    seed_terrains()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Fixtures para testes FastAPI"""
    return TestClient(app)
