# backend/src/tests/conftest.py

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import NullPool
from src.db import Base, build_engine, build_session
from src.app import create_app

TEST_DATABASE_URL = "sqlite:///./test_tmp.db"
TEST_ENGINE = build_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = build_session(TEST_ENGINE)

@pytest.fixture(scope="session", autouse=True)
def init_db():
    # Cria o schema uma vez antes de todos os testes
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    # Destroi o schema ao final da sessão de testes
    Base.metadata.drop_all(bind=TEST_ENGINE)

@pytest.fixture
def db_session(monkeypatch):
    """
    Sobrescreve engine, SessionLocal e get_db para usar a sessão de testes em memória.
    """
    # Override da fábrica de sessão e engine no módulo de DB
    monkeypatch.setattr("src.db.engine", TEST_ENGINE)
    monkeypatch.setattr("src.db.SessionLocal", TestingSessionLocal)

    # Override do dependency get_db() em src.main
    def _get_test_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    monkeypatch.setattr("src.main.get_db", _get_test_db)

    return TestingSessionLocal()

@pytest.fixture
def client():
    app = create_app(TestingSessionLocal, TEST_ENGINE)
    return TestClient(app)