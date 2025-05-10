import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.db import get_db, SessionLocal
from src.models.player import Player
from src.models.terrain import Terrain
from src.schemas.terrain import TerrainCreate
from src.schemas.player import PlayerCreate
from src.crud.terrain import create_terrain
from src.crud.quadrant import get_quadrants
from src.crud.player import create_player

def test_quadrant_auto_generation():
    """
    Test to verify that quadrants are auto-generated when a terrain is created.
    """
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create a new player for testing
        player_data = PlayerCreate(name="Quadrant Test Player", balance=1000.0)
        player = create_player(db, player_data)
        print(f"Created test player with ID: {player.id}")

        
        # Create a terrain for this player
        terrain_data = TerrainCreate(
            player_id=player.id,
            name="Test Quadrant Terrain",
            x_coordinate=10.0,
            y_coordinate=10.0,
            access_type="public"
        )
        
        # Create the terrain (should auto-generate quadrants)
        terrain = create_terrain(db, terrain_data)
        print(f"Created terrain with ID: {terrain.id}")
        
        # Get the quadrants for this terrain
        quadrants = get_quadrants(db, terrain.id)
        
        # Check if exactly 15 quadrants were created
        if len(quadrants) != 15:
            print(f"Error: Expected 15 quadrants, but got {len(quadrants)}")
            return False
        
        # Check if all expected labels are present
        expected_labels = [f"{row}{col}" for row in ["A", "B", "C"] for col in ["1", "2", "3", "4", "5"]]
        actual_labels = [q.label for q in quadrants]
        
        # Sort both lists to ensure proper comparison
        expected_labels.sort()
        actual_labels.sort()
        
        if actual_labels != expected_labels:
            print(f"Error: Expected labels {expected_labels}, but got {actual_labels}")
            return False
        
        # Verify that each quadrant has the correct terrain_id
        for quadrant in quadrants:
            if quadrant.terrain_id != terrain.id:
                print(f"Error: Quadrant {quadrant.label} has terrain_id {quadrant.terrain_id}, expected {terrain.id}")
                return False
        
        print("Success! All quadrants were properly generated with the correct labels and terrain_id")
        return True
        
    finally:
        db.close()

if __name__ == "__main__":
    success = test_quadrant_auto_generation()
    print(f"Test result: {'Success' if success else 'Failure'}")
    sys.exit(0 if success else 1)
