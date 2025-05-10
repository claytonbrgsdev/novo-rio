# backend/tests/conftest.py

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.db import Base, build_engine, build_session, get_async_db, get_db_override
from src.main import app

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