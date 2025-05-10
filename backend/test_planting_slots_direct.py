"""
Direct test for planting slots functionality using FastAPI TestClient.
This script tests the following:
1. Creating a planting in a valid slot
2. Attempting to create a planting in an already occupied slot (should fail)
3. Retrieving plantings by quadrant
"""
import os
import sys
import logging
from fastapi.testclient import TestClient

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.main import app
from src.db import engine, Base
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.models.species import Species

def setup_test_database():
    """Create all necessary tables for testing."""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Creating test database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully!")
        
        # Add a test species if it doesn't exist
        from sqlalchemy.orm import Session
        with Session(engine) as session:
            species = session.query(Species).filter(Species.key == "test_species_1").first()
            if not species:
                logger.info("Adding seed species...")
                species = Species(
                    key="test_species_1",
                    common_name="Test Species 1",
                    germinacao_dias=7,
                    maturidade_dias=30,
                    agua_diaria_min=2.5,
                    espaco_m2=1.0,
                    rendimento_unid=10,
                    tolerancia_seca="média"
                )
                session.add(species)
                session.commit()
                
        return True
    except Exception as e:
        logger.error(f"Error setting up test database: {e}")
        return False

def test_planting_slots():
    """Test the planting slots implementation using the FastAPI test client."""
    print("\n=========== TESTING PLANTING SLOTS FUNCTIONALITY ===========")
    client = TestClient(app)
    
    # Test data dictionary to store IDs between tests
    test_data = {}
    
    # 1. Create a player
    print("\n1. Creating test player...")
    player_data = {"name": "Planting Slots Test Player", "balance": 500.0, "aura": 100.0}
    player_response = client.post("/players/", json=player_data)
    
    if player_response.status_code != 200:
        print(f"ERROR: Failed to create player. Status: {player_response.status_code}")
        print(f"Response: {player_response.json()}")
        return False
    
    player = player_response.json()
    test_data["player_id"] = player["id"]
    print(f"Created player with ID: {player['id']}")
    
    # 2. Create a terrain for this player
    print("\n2. Creating test terrain...")
    terrain_data = {
        "player_id": player["id"],
        "name": "Planting Slots Test Terrain",
        "x_coordinate": 10.0,
        "y_coordinate": 10.0,
        "access_type": "public"
    }
    
    terrain_response = client.post("/terrains/", json=terrain_data)
    
    if terrain_response.status_code != 200:
        print(f"ERROR: Failed to create terrain. Status: {terrain_response.status_code}")
        print(f"Response: {terrain_response.json()}")
        return False
    
    terrain = terrain_response.json()
    test_data["terrain_id"] = terrain["id"]
    print(f"Created terrain with ID: {terrain['id']}")
    
    # 3. Get the quadrants for this terrain
    print("\n3. Getting quadrants for terrain...")
    quadrants_response = client.get(f"/quadrants/?terrain_id={terrain['id']}")
    
    if quadrants_response.status_code != 200:
        print(f"ERROR: Failed to retrieve quadrants. Status: {quadrants_response.status_code}")
        print(f"Response: {quadrants_response.json()}")
        return False
    
    quadrants = quadrants_response.json()
    if not quadrants:
        print("ERROR: No quadrants found for terrain")
        return False
    
    print(f"Found {len(quadrants)} quadrants")
    test_data["quadrant_id"] = quadrants[0]["id"]
    print(f"Using quadrant with ID: {test_data['quadrant_id']} and label: {quadrants[0]['label']}")
    
    # 4. Create a planting in slot 1
    print("\n4. Creating planting in slot 1...")
    planting_data1 = {
        "player_id": test_data["player_id"],
        "species_id": 1,  # First species
        "quadrant_id": test_data["quadrant_id"],
        "slot_index": 1
    }
    
    planting_response1 = client.post("/plantings/", json=planting_data1)
    
    if planting_response1.status_code != 200:
        print(f"ERROR: Failed to create planting in slot 1. Status: {planting_response1.status_code}")
        print(f"Response: {planting_response1.json()}")
        return False
    
    planting1 = planting_response1.json()
    test_data["planting1_id"] = planting1["id"]
    print(f"Created planting in slot 1 with ID: {planting1['id']}")
    
    # 5. Create another planting in slot 2
    print("\n5. Creating planting in slot 2...")
    planting_data2 = {
        "player_id": test_data["player_id"],
        "species_id": 1,  # First species
        "quadrant_id": test_data["quadrant_id"],
        "slot_index": 2
    }
    
    planting_response2 = client.post("/plantings/", json=planting_data2)
    
    if planting_response2.status_code != 200:
        print(f"ERROR: Failed to create planting in slot 2. Status: {planting_response2.status_code}")
        print(f"Response: {planting_response2.json()}")
        return False
    
    planting2 = planting_response2.json()
    test_data["planting2_id"] = planting2["id"]
    print(f"Created planting in slot 2 with ID: {planting2['id']}")
    
    # 6. Try to create a planting in slot 1 again (should fail due to uniqueness constraint)
    print("\n6. Testing duplicate slot detection (should fail)...")
    duplicate_planting_data = {
        "player_id": test_data["player_id"],
        "species_id": 1,  # First species
        "quadrant_id": test_data["quadrant_id"],
        "slot_index": 1  # This slot is already occupied
    }
    
    duplicate_response = client.post("/plantings/", json=duplicate_planting_data)
    
    if duplicate_response.status_code == 400:
        print("SUCCESS: Correctly prevented duplicate planting in slot 1")
        print(f"Error message: {duplicate_response.json()['detail']}")
    else:
        print(f"ERROR: Expected status 400, got {duplicate_response.status_code}")
        print(f"Response: {duplicate_response.json()}")
        return False
    
    # 7. Get all plantings for this quadrant
    print("\n7. Retrieving plantings by quadrant...")
    quadrant_plantings_response = client.get(f"/plantings/?quadrant_id={test_data['quadrant_id']}")
    
    if quadrant_plantings_response.status_code != 200:
        print(f"ERROR: Failed to retrieve plantings. Status: {quadrant_plantings_response.status_code}")
        print(f"Response: {quadrant_plantings_response.json()}")
        return False
    
    quadrant_plantings = quadrant_plantings_response.json()
    if len(quadrant_plantings) != 2:
        print(f"ERROR: Expected 2 plantings in quadrant, got {len(quadrant_plantings)}")
        return False
    
    # Verify slot indexes
    slot_indexes = [p["slot_index"] for p in quadrant_plantings]
    print(f"Found plantings with slot indexes: {slot_indexes}")
    
    if 1 not in slot_indexes or 2 not in slot_indexes:
        print(f"ERROR: Expected slots 1 and 2, got {slot_indexes}")
        return False
    
    print("\n=========== ALL TESTS PASSED SUCCESSFULLY! ===========")
    print("The planting slots implementation is working correctly.")
    return True

if __name__ == "__main__":
    # First set up the test database
    if not setup_test_database():
        print("Failed to set up test database")
        sys.exit(1)
    
    # Run the tests
    success = test_planting_slots()
    sys.exit(0 if success else 1)
