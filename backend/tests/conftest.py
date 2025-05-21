# backend/tests/conftest.py

import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import timedelta, datetime
from src.db import Base, build_engine, build_session, get_async_db, get_db_override
from src.main import app
from src.crud.user import create_user
from src.schemas.user import UserCreate, UserOut
from src.auth.security import create_access_token
import hashlib
from datetime import datetime

def get_password_hash(password: str) -> str:
    """Simple password hashing for tests"""
    return hashlib.sha256(password.encode()).hexdigest()

# Get database URL from environment, with fallback to SQLite for local testing
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_tmp.db")

# Sync DB setup - use poolclass=NullPool only for SQLite
if TEST_DATABASE_URL.startswith("sqlite"):
    TEST_ENGINE = build_engine(TEST_DATABASE_URL, poolclass=NullPool)
else:
    TEST_ENGINE = build_engine(TEST_DATABASE_URL)
TestingSessionLocal = build_session(TEST_ENGINE)

# Async DB setup
if TEST_DATABASE_URL.startswith("sqlite"):
    ASYNC_TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_async_tmp.db"
elif TEST_DATABASE_URL.startswith("postgresql"):
    ASYNC_TEST_DATABASE_URL = TEST_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_TEST_DATABASE_URL = TEST_DATABASE_URL

# Configure async engine appropriately for the database type
if ASYNC_TEST_DATABASE_URL.startswith("sqlite"):
    ASYNC_TEST_ENGINE = create_async_engine(
        ASYNC_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
elif ASYNC_TEST_DATABASE_URL.startswith("postgresql+asyncpg"):
    ASYNC_TEST_ENGINE = create_async_engine(
        ASYNC_TEST_DATABASE_URL,
        # Configure PostgreSQL connection parameters for tests
        pool_size=5,
        max_overflow=0,  # Limit concurrent connections
        pool_pre_ping=True,  # Verify connections before using
        pool_use_lifo=True,  # Last In, First Out - better for tests
        pool_recycle=3600,   # Recycle connections after one hour
    )
else:
    ASYNC_TEST_ENGINE = create_async_engine(ASYNC_TEST_DATABASE_URL)

AsyncTestingSessionLocal = sessionmaker(
    bind=ASYNC_TEST_ENGINE,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="function", autouse=True)
async def init_db():
    # Import all models to ensure they are registered with the Base metadata
    from src.models.user import User
    from src.models.player import Player
    from src.models.terrain import Terrain
    from src.models.quadrant import Quadrant
    from src.models.species import Species
    from src.models.planting import Planting
    from src.models.input import Input
    
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
def test_user(db_session):
    """Create a test user and return user data with auth token."""
    # Create test user
    user_data = {
        "email": "test@example.com",
        "hashed_password": get_password_hash("testpassword"),
        "is_active": True,
        "is_superuser": False,
        "player_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Check if user already exists
    from src.models.user import User
    user = db_session.query(User).filter(User.email == user_data["email"]).first()
    
    if not user:
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    
    # Generate JWT token
    token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=30)
    )
    
    return {
        "id": user.id,
        "email": user.email,
        "token": token
    }

@pytest.fixture
def test_player(db_session, test_user):
    """Create a test player associated with the test user."""
    from src.models.player import Player
    
    player_data = {
        "name": "Test Player",
        "level": 1,
        "experience": 0,
        "coins": 1000,
        "user_id": test_user["id"]
    }
    
    player = Player(**player_data)
    db_session.add(player)
    db_session.commit()
    db_session.refresh(player)
    
    # Update user with player_id
    from src.models.user import User
    user = db_session.query(User).filter(User.id == test_user["id"]).first()
    user.player_id = player.id
    db_session.commit()
    
    return player

@pytest.fixture
def test_terrain(db_session, test_player):
    """Create a test terrain associated with the test player."""
    from src.models.terrain import Terrain
    
    terrain_data = {
        "name": "Test Terrain",
        "size_x": 10,
        "size_y": 10,
        "access_type": "private",
        "player_id": test_player.id
    }
    
    terrain = Terrain(**terrain_data)
    db_session.add(terrain)
    db_session.commit()
    db_session.refresh(terrain)
    
    return terrain

@pytest.fixture
def test_quadrant(db_session, test_terrain):
    """Create a test quadrant in the test terrain."""
    from src.models.quadrant import Quadrant
    
    quadrant_data = {
        "x": 0,
        "y": 0,
        "soil_health": 100,
        "moisture_level": 50,
        "terrain_id": test_terrain.id
    }
    
    quadrant = Quadrant(**quadrant_data)
    db_session.add(quadrant)
    db_session.commit()
    db_session.refresh(quadrant)
    
    return quadrant

@pytest.fixture
def test_species(db_session):
    """Create a test plant species."""
    from src.models.species import Species
    
    species_data = {
        "name": "Test Plant",
        "description": "A test plant species",
        "growth_time_hours": 24,
        "base_value": 50,
        "water_consumption": 10,
        "fertilizer_consumption": 5,
        "pesticide_resistance": 0.5
    }
    
    species = Species(**species_data)
    db_session.add(species)
    db_session.commit()
    db_session.refresh(species)
    
    return species

@pytest.fixture
def test_planting(db_session, test_quadrant, test_species):
    """Create a test planting in the test quadrant."""
    from src.models.planting import Planting
    
    planting_data = {
        "quadrant_id": test_quadrant.id,
        "species_id": test_species.id,
        "planted_at": datetime.utcnow(),
        "status": "growing"
    }
    
    planting = Planting(**planting_data)
    db_session.add(planting)
    db_session.commit()
    db_session.refresh(planting)
    
    return planting

@pytest.fixture
def test_input(db_session, test_planting):
    """Create a test input for the test planting."""
    from src.models.input import Input
    
    input_data = {
        "planting_id": test_planting.id,
        "type": "water",
        "quantity": 1.0,
        "applied_at": datetime.utcnow()
    }
    
    input_record = Input(**input_data)
    db_session.add(input_record)
    db_session.commit()
    db_session.refresh(input_record)
    
    return input_record

@pytest.fixture(scope="function")
def event_loop():
    """Create an instance of the default event loop for each test case.
    
    This fixture ensures each test gets a fresh event loop and properly closes it.
    Using function scope to prevent issues with loop reuse between tests.
    """
    import asyncio
    
    # Create a new event loop for this test
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        yield loop
    finally:
        # Clean up the loop
        try:
            # Cancel all pending tasks
            pending = asyncio.all_tasks(loop=loop)
            for task in pending:
                task.cancel()
                try:
                    loop.run_until_complete(task)
                except asyncio.CancelledError:
                    pass
            
            # Run the loop until all tasks are done
            loop.run_until_complete(loop.shutdown_asyncgens())
        finally:
            # Close the loop
            loop.close()
            asyncio.set_event_loop(None)

@pytest.fixture
async def get_async_db_override():
    """Override for the async database dependency for testing.
    
    This fixture ensures proper session management and prevents connection leaks.
    It explicitly rolls back transactions to avoid test interactions.
    """
    session = AsyncTestingSessionLocal()
    try:
        await session.begin()
        yield session
    finally:
        if session.in_transaction():
            await session.rollback()
        await session.close()

@pytest.fixture
async def async_client(event_loop, get_async_db_override):
    """Create an async test client with overridden dependencies.
    
    This fixture ensures proper event loop handling and database connection management.
    It uses the event_loop fixture from pytest-asyncio to prevent event loop conflicts.
    It also uses the get_async_db_override fixture for database sessions.
    """
    from httpx import AsyncClient
    from src.main import app
    from src.db import get_async_db
    
    # Override the async database dependency with our fixture
    async def override_get_async_db():
        yield get_async_db_override
    
    # Apply the override
    app.dependency_overrides[get_async_db] = override_get_async_db
    
    # Create async test client with the overridden app
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    # Clear overrides after the test
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(test_user):
    """Return authentication headers for the test user."""
    return {"Authorization": f"Bearer {test_user['token']}"}