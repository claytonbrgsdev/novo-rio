import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.db import Base, engine
import src.models  # ensure models are registered

@pytest.fixture(scope="session", autouse=True)
def create_tables():
    # Ensure DB schema is created
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Fixtures para testes FastAPI"""
    return TestClient(app)
