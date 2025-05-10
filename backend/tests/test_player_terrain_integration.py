import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from src.db import Base
from src.main import app

# Setup test database and client for integration tests
TEST_DB_FILE = "test_integration.db"
TEST_DATABASE_URL = f"sqlite:///./{TEST_DB_FILE}"

def setup_test_db(url=TEST_DATABASE_URL):
    """Setup a test database for integration tests"""
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Setup test client with overridden dependencies
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    # Override dependencies
    from src.db import get_db
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    return client, engine

def cleanup_test_db(engine):
    """Clean up test database after tests"""
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

def test_player_terrains_relationship():
    """Test that a player can own multiple terrains and they can be retrieved via API."""
    # Setup test database and client
    client, engine = setup_test_db()
    
    try:
        # Step 1: Create a test player
        player_data = {
            "name": "Test Player",
            "balance": 100.0,
            "aura": 95.0
        }
        
        response = client.post("/players", json=player_data)
        assert response.status_code == 200, f"Failed to create player: {response.text}"
        player = response.json()
        player_id = player["id"]
        
        # Step 2: Create multiple terrains for the player
        terrain_data_1 = {
            "player_id": player_id,
            "name": "Forest Plot",
            "x_coordinate": 10.5,
            "y_coordinate": 20.7,
            "access_type": "public"
        }
        
        terrain_data_2 = {
            "player_id": player_id,
            "name": "Mountain Plot",
            "x_coordinate": 15.3,
            "y_coordinate": 25.1,
            "access_type": "private"
        }
        
        # Create first terrain
        response = client.post("/terrains", json=terrain_data_1)
        assert response.status_code == 200, f"Failed to create terrain 1: {response.text}"
        terrain1 = response.json()
        
        # Create second terrain
        response = client.post("/terrains", json=terrain_data_2)
        assert response.status_code == 200, f"Failed to create terrain 2: {response.text}"
        terrain2 = response.json()
        
        # Step 3: Get all terrains for the player
        response = client.get(f"/players/{player_id}/terrains")
        assert response.status_code == 200, f"Failed to get player terrains: {response.text}"
        terrains = response.json()
        
        # Verify we got exactly the two terrains we created
        assert len(terrains) == 2, f"Expected 2 terrains, got {len(terrains)}"
        assert {t["id"] for t in terrains} == {terrain1["id"], terrain2["id"]}
        assert {t["name"] for t in terrains} == {terrain_data_1["name"], terrain_data_2["name"]}
        
        # Step 4: Get player with nested terrains
        response = client.get(f"/players/{player_id}/with-terrains")
        assert response.status_code == 200, f"Failed to get player with terrains: {response.text}"
        player_with_terrains = response.json()
        
        # Verify player data
        assert player_with_terrains["id"] == player_id
        assert player_with_terrains["name"] == player_data["name"]
        
        # Verify nested terrains
        assert len(player_with_terrains["terrains"]) == 2
        terrain_ids = {t["id"] for t in player_with_terrains["terrains"]}
        assert terrain_ids == {terrain1["id"], terrain2["id"]}
    
    finally:
        # Clean up database after test
        cleanup_test_db(engine)

def test_player_terrains_relationship_async():
    """Test that a player can own multiple terrains and they can be retrieved via async API."""
    # Setup test database and client
    client, engine = setup_test_db()
    
    try:
        # Step 1: Create a test player
        player_data = {
            "name": "Async Test Player",
            "balance": 200.0,
            "aura": 90.0
        }
        
        response = client.post("/async/players", json=player_data)
        assert response.status_code == 200, f"Failed to create async player: {response.text}"
        player = response.json()
        player_id = player["id"]
        
        # Step 2: Create multiple terrains for the player
        terrain_data_1 = {
            "player_id": player_id,
            "name": "River Plot",
            "x_coordinate": 30.5,
            "y_coordinate": 40.7,
            "access_type": "public"
        }
        
        terrain_data_2 = {
            "player_id": player_id,
            "name": "Valley Plot",
            "x_coordinate": 35.3,
            "y_coordinate": 45.1,
            "access_type": "private"
        }
        
        # Create first terrain
        response = client.post("/async/terrains", json=terrain_data_1)
        assert response.status_code == 200, f"Failed to create async terrain 1: {response.text}"
        terrain1 = response.json()
        
        # Create second terrain
        response = client.post("/async/terrains", json=terrain_data_2)
        assert response.status_code == 200, f"Failed to create async terrain 2: {response.text}"
        terrain2 = response.json()
        
        # Step 3: Get all terrains for the player
        response = client.get(f"/async/players/{player_id}/terrains")
        assert response.status_code == 200, f"Failed to get async player terrains: {response.text}"
        terrains = response.json()
        
        # Verify we got exactly the two terrains we created
        assert len(terrains) == 2, f"Expected 2 terrains, got {len(terrains)}"
        assert {t["id"] for t in terrains} == {terrain1["id"], terrain2["id"]}
        assert {t["name"] for t in terrains} == {terrain_data_1["name"], terrain_data_2["name"]}
        
        # Step 4: Get player with nested terrains
        response = client.get(f"/async/players/{player_id}/with-terrains")
        assert response.status_code == 200, f"Failed to get async player with terrains: {response.text}"
        player_with_terrains = response.json()
        
        # Verify player data
        assert player_with_terrains["id"] == player_id
        assert player_with_terrains["name"] == player_data["name"]
        
        # Verify nested terrains
        assert len(player_with_terrains["terrains"]) == 2
        terrain_ids = {t["id"] for t in player_with_terrains["terrains"]}
        assert terrain_ids == {terrain1["id"], terrain2["id"]}
    
    finally:
        # Clean up database after test
        cleanup_test_db(engine)

def test_player_with_no_terrains():
    """Test that a player with no terrains returns an empty list when fetching terrains."""
    # Setup test database and client
    client, engine = setup_test_db()
    
    try:
        # Create a player
        player_data = {
            "name": "Player Without Terrains",
            "balance": 50.0,
            "aura": 100.0
        }
        
        response = client.post("/players", json=player_data)
        assert response.status_code == 200, f"Failed to create player: {response.text}"
        player = response.json()
        player_id = player["id"]
        
        # Get terrains for the player (should be empty)
        response = client.get(f"/players/{player_id}/terrains")
        assert response.status_code == 200, f"Failed to get player terrains: {response.text}"
        terrains = response.json()
        
        # Verify empty list is returned
        assert len(terrains) == 0, f"Expected empty list, got {len(terrains)} items"
        assert terrains == []
        
        # Get player with terrains (should have empty terrains list)
        response = client.get(f"/players/{player_id}/with-terrains")
        assert response.status_code == 200, f"Failed to get player with terrains: {response.text}"
        player_with_terrains = response.json()
        
        assert player_with_terrains["id"] == player_id
        assert player_with_terrains["terrains"] == []
    
    finally:
        # Clean up database after test
        cleanup_test_db(engine)

def test_nonexistent_player_terrains():
    """Test that requesting terrains for a non-existent player returns a 404 error."""
    # Setup test database and client
    client, engine = setup_test_db()
    
    try:
        # Use a player ID that doesn't exist (very high number)
        nonexistent_player_id = 9999
        
        # Try to get terrains for non-existent player
        response = client.get(f"/players/{nonexistent_player_id}/terrains")
        assert response.status_code == 404, "Expected 404 for non-existent player terrains"
        
        # Try to get player with terrains for non-existent player
        response = client.get(f"/players/{nonexistent_player_id}/with-terrains")
        assert response.status_code == 404, "Expected 404 for non-existent player with terrains"
        
        # Also test async endpoints
        response = client.get(f"/async/players/{nonexistent_player_id}/terrains")
        assert response.status_code == 404, "Expected 404 for async non-existent player terrains"
        
        response = client.get(f"/async/players/{nonexistent_player_id}/with-terrains")
        assert response.status_code == 404, "Expected 404 for async non-existent player with terrains"
    
    finally:
        # Clean up database after test
        cleanup_test_db(engine)
