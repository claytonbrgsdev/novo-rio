import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.db import get_db, SessionLocal
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.schemas.planting import PlantingCreate
from src.crud.player import create_player
from src.schemas.player import PlayerCreate
from src.crud.terrain import create_terrain
from src.schemas.terrain import TerrainCreate
from src.crud.planting import create_planting, get_plantings_by_quadrant, is_slot_available

def test_planting_slots_implementation():
    """
    Test the complete planting slots implementation by creating:
    1. A player
    2. A terrain (which auto-generates quadrants)
    3. Two plantings in different slots of the same quadrant
    4. Verify slot uniqueness constraint
    """
    print("Running planting slots implementation test...")
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create a new player for testing
        player_data = PlayerCreate(name="Planting Slots Test Player", balance=1000.0)
        player = create_player(db, player_data)
        print(f"Created test player with ID: {player.id}")
        
        # Create a terrain for this player
        terrain_data = TerrainCreate(
            player_id=player.id,
            name="Planting Slots Test Terrain",
            x_coordinate=15.0,
            y_coordinate=15.0,
            access_type="public"
        )
        
        # Create the terrain (should auto-generate quadrants)
        terrain = create_terrain(db, terrain_data)
        print(f"Created terrain with ID: {terrain.id}")
        
        # Get the quadrants for this terrain
        quadrants = db.query(Quadrant).filter(Quadrant.terrain_id == terrain.id).all()
        print(f"Found {len(quadrants)} quadrants for the terrain")
        
        if len(quadrants) != 15:
            print(f"ERROR: Expected 15 quadrants, but got {len(quadrants)}")
            return False
        
        # Take the first quadrant to use for planting tests
        quadrant = quadrants[0]
        print(f"Using quadrant with ID: {quadrant.id} and label: {quadrant.label}")
        
        # Test 1: Create a planting in slot 1
        planting_data1 = PlantingCreate(
            player_id=player.id,
            quadrant_id=quadrant.id,
            slot_index=1,
            species_id=1  # Assuming species ID 1 exists
        )
        
        try:
            planting1 = create_planting(db, planting_data1)
            print(f"Created planting in slot 1 with ID: {planting1.id}")
        except ValueError as e:
            print(f"ERROR: Failed to create planting in slot 1: {e}")
            return False
        
        # Test 2: Create another planting in the same quadrant but different slot (slot 2)
        planting_data2 = PlantingCreate(
            player_id=player.id,
            quadrant_id=quadrant.id,
            slot_index=2,
            species_id=1
        )
        
        try:
            planting2 = create_planting(db, planting_data2)
            print(f"Created planting in slot 2 with ID: {planting2.id}")
        except ValueError as e:
            print(f"ERROR: Failed to create planting in slot 2: {e}")
            return False
        
        # Test 3: Try to create a planting in an already occupied slot (should fail)
        planting_data3 = PlantingCreate(
            player_id=player.id,
            quadrant_id=quadrant.id,
            slot_index=1,  # This slot is already taken by planting1
            species_id=1
        )
        
        try:
            planting3 = create_planting(db, planting_data3)
            print(f"ERROR: Created planting in an occupied slot with ID: {planting3.id}")
            return False
        except ValueError as e:
            print(f"SUCCESS: Correctly prevented creating a planting in an occupied slot: {e}")
        
        # Test 4: Verify is_slot_available function
        assert is_slot_available(db, quadrant.id, 3) is True, "Slot 3 should be available"
        assert is_slot_available(db, quadrant.id, 1) is False, "Slot 1 should not be available"
        
        # Test 5: Get all plantings for the quadrant
        quadrant_plantings = get_plantings_by_quadrant(db, quadrant.id)
        assert len(quadrant_plantings) == 2, f"Expected 2 plantings in quadrant, got {len(quadrant_plantings)}"
        
        print("All tests passed! The planting slots implementation is working correctly.")
        return True
        
    finally:
        db.close()

if __name__ == "__main__":
    success = test_planting_slots_implementation()
    print(f"Test result: {'Success' if success else 'Failure'}")
    sys.exit(0 if success else 1)
