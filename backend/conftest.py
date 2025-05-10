import sys
import os

backend_root = os.path.abspath(os.path.dirname(__file__))
src_path = os.path.join(backend_root, "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.main import create_app # Import create_app factory
from src.db import Base, get_db # Import Base for creating tables and get_db for overriding

# Define a test database URL (e.g., in-memory or a separate file)
TEST_DATABASE_URL = "sqlite:///./test_db.sqlite3" # Or "sqlite:///:memory:"

@pytest.fixture(scope="session")
def test_engine():
    # Create a synchronous engine for tests
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    # Create tables in the test database
    Base.metadata.create_all(bind=engine)
    yield engine
    # Optional: Clean up the test database file after tests run
    if os.path.exists("./test_db.sqlite3"): # Check if it's a file DB
        os.remove("./test_db.sqlite3")

@pytest.fixture(scope="function")
def TestSessionLocal(test_engine):
    # Create a sessionmaker bound to the test engine
    _TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    return _TestSessionLocal

@pytest.fixture(scope="function")
def db_session(TestSessionLocal):
    # Fixture to provide a test database session
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session") # Changed to session scope for app, override can be function scoped
def client(test_engine): # test_engine fixture ensures DB is set up
    # Create the app instance using the factory, providing the test session_local
    # For the main app used by TestClient, we need to override get_db
    
    # Create a SessionLocal specific for this client's app instance
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    app_instance = create_app(session_local=TestingSessionLocal) # Pass the test session factory

    # The create_app function itself should handle the override if session_local is provided.
    # If it doesn't, we can do it here explicitly:
    # def override_get_db():
    #     try:
    #         db = TestingSessionLocal()
    #         yield db
    #     finally:
    #         db.close()
    # app_instance.dependency_overrides[get_db] = override_get_db

    with TestClient(app_instance) as c:
        yield c
