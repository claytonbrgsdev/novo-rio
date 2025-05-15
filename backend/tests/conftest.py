# backend/tests/conftest.py

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import timedelta
from src.db import Base, build_engine, build_session, get_async_db, get_db_override
from src.main import app
from src.crud.user import create_user
from src.schemas.user import UserCreate
from src.auth.security import create_access_token

# Sync DB setup
TEST_DATABASE_URL = "sqlite:///./test_tmp.db"
TEST_ENGINE = build_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = build_session(TEST_ENGINE)

# Async DB setup
ASYNC_TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_async_tmp.db"
ASYNC_TEST_ENGINE = create_async_engine(
    ASYNC_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
AsyncTestingSessionLocal = sessionmaker(
    bind=ASYNC_TEST_ENGINE,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="session", autouse=True)
async def init_db():
    # Import all models to ensure they are registered with the Base metadata
    from src.models.user import User
    from src.models.player import Player
    from src.models.terrain import Terrain
    # ... import outros modelos necessários
    
    # Create schema for sync db
    Base.metadata.create_all(bind=TEST_ENGINE)
    
    # Create schema for async db
    async with ASYNC_TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Clean up after tests
    Base.metadata.drop_all(bind=TEST_ENGINE)
    
    # Clean up async db
    async with ASYNC_TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
def db_session():
    """
    Returns a SQLAlchemy session for testing.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()

@pytest.fixture
def client(db_session):
    """
    Create a test client with overridden dependencies.
    """
    # Override the sync get_db dependency
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # Override the async get_db dependency
    def override_get_async_db():
        try:
            yield db_session
        finally:
            pass
    
    # Apply the overrides
    from src.db import get_db
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_async_db()] = override_get_async_db
    
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def auth_headers(db_session):
    """
    Cria um usuário de teste e retorna headers de autenticação com seu token JWT.
    """
    # Criar usuário de teste
    user_create = UserCreate(
        email="test@user.com",
        password="password123",
        player_id=None
    )
    user = create_user(db_session, user_create)
    
    # Gerar token JWT com user_id e email no payload
    token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=30)
    )
    
    # Retornar cabeçalhos de autenticação e o usuário
    headers = {"Authorization": f"Bearer {token}"}
    return headers, user