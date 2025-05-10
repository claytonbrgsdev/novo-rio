import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from src.main import app
from src.schemas.input import InputCreate
from src.models.input import Input
from src.models.planting import Planting
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.species import Species
from src.db import get_db, engine, Base
from sqlalchemy.orm import Session

# Inicializa o cliente de teste
client = TestClient(app)

@pytest.fixture(scope="module")
def test_data():
    """Fixture to store test data between tests"""
    return {}

def test_create_input_success(client, test_data):
    """Test creating an input (water) for a planting succeeds"""
    # 1. Create a player for testing
    player_data = {"name": "Input Test Player", "balance": 500.0, "aura": 100.0}
    player_response = client.post("/players/", json=player_data)
    assert player_response.status_code == 200
    player = player_response.json()
    test_data["player_id"] = player["id"]
    
    # 2. Create a terrain for this player
    terrain_data = {
        "player_id": player["id"],
        "name": "Input Test Terrain",
        "x_coordinate": 10.0,
        "y_coordinate": 10.0,
        "access_type": "public"
    }
    
    terrain_response = client.post("/terrains/", json=terrain_data)
    assert terrain_response.status_code == 200
    terrain = terrain_response.json()
    test_data["terrain_id"] = terrain["id"]
    
    # 3. Get the quadrants for this terrain
    quadrants_response = client.get(f"/quadrants/?terrain_id={terrain['id']}")
    assert quadrants_response.status_code == 200
    quadrants = quadrants_response.json()
    assert len(quadrants) > 0
    
    test_data["quadrant_id"] = quadrants[0]["id"]
    
    # 4. Create a planting in the quadrant (slot 1)
    planting_data = {
        "player_id": player["id"],
        "species_id": 1,  # Assuming species with ID 1 exists
        "quadrant_id": test_data["quadrant_id"],
        "slot_index": 1
    }
    
    planting_response = client.post("/plantings/", json=planting_data)
    assert planting_response.status_code == 200
    planting = planting_response.json()
    test_data["planting_id"] = planting["id"]
    
    # 5. Create an input (water) for the planting
    input_data = {
        "planting_id": planting["id"],
        "type": "água",
        "quantity": 5.0
    }
    
    input_response = client.post("/inputs/", json=input_data)
    assert input_response.status_code == 200
    input_record = input_response.json()
    
    # Verify the input data
    assert input_record["planting_id"] == planting["id"]
    assert input_record["type"] == "água"
    assert input_record["quantity"] == 5.0
    assert "applied_at" in input_record
    assert "id" in input_record
    
    test_data["input_id"] = input_record["id"]

def test_get_inputs_by_planting(client, test_data):
    """Test retrieving inputs for a specific planting"""
    # Get inputs for the planting we created
    response = client.get(f"/inputs/?planting_id={test_data['planting_id']}")
    assert response.status_code == 200
    
    inputs = response.json()
    assert len(inputs) >= 1  # We created at least one input
    
    # Verify our input is in the list
    input_ids = [input_record["id"] for input_record in inputs]
    assert test_data["input_id"] in input_ids
    
    # Verify the first input's properties
    assert inputs[0]["type"] == "água"
    assert inputs[0]["quantity"] == 5.0
    assert inputs[0]["planting_id"] == test_data["planting_id"]

def test_create_input_invalid_planting(client):
    """Test creating an input for a non-existent planting fails"""
    # Try to create an input for a planting that doesn't exist
    input_data = {
        "planting_id": 99999,  # Invalid planting ID
        "type": "fertilizante",
        "quantity": 2.5
    }
    
    response = client.post("/inputs/", json=input_data)
    assert response.status_code == 400
    assert "not found" in response.json()["detail"]

def test_get_input_by_id(client, test_data):
    """Test retrieving a specific input by ID"""
    response = client.get(f"/inputs/{test_data['input_id']}")
    assert response.status_code == 200
    
    input_record = response.json()
    assert input_record["id"] == test_data["input_id"]
    assert input_record["type"] == "água"
    assert input_record["quantity"] == 5.0

def test_delete_input(client, test_data):
    """Test deleting an input"""
    # First, create a new input to delete
    input_data = {
        "planting_id": test_data["planting_id"],
        "type": "composto",
        "quantity": 3.0
    }
    
    create_response = client.post("/inputs/", json=input_data)
    assert create_response.status_code == 200
    new_input = create_response.json()
    
    # Delete the input
    delete_response = client.delete(f"/inputs/{new_input['id']}")
    assert delete_response.status_code == 200
    assert "deleted successfully" in delete_response.json()["message"]
    
    # Verify it's gone
    get_response = client.get(f"/inputs/{new_input['id']}")
    assert get_response.status_code == 404
