"""
Direct test of planting slots functionality using SQLite.
"""
import sqlite3
import os
import sys
import json

def test_planting_slots():
    """
    Test the planting slots implementation using direct SQLite connections.
    """
    print("Running direct planting slots test...")
    
    # Connect to the database
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "db.sqlite3"))
    print(f"Using database at: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    cursor = conn.cursor()
    
    try:
        # 1. First, make sure we have a test player
        cursor.execute("SELECT id FROM players WHERE name = ?", ("Direct Test Player",))
        player = cursor.fetchone()
        
        if not player:
            print("Creating test player...")
            cursor.execute(
                "INSERT INTO players (name, balance, aura, actions_count) VALUES (?, ?, ?, ?)",
                ("Direct Test Player", 1000.0, 100.0, 0)
            )
            conn.commit()
            player_id = cursor.lastrowid
        else:
            player_id = player['id']
        
        print(f"Using player with ID: {player_id}")
        
        # 2. Create a test terrain
        cursor.execute(
            "INSERT INTO terrains (player_id, name, x_coordinate, y_coordinate, access_type) VALUES (?, ?, ?, ?, ?)",
            (player_id, "Direct Test Terrain", 20.0, 20.0, "public")
        )
        conn.commit()
        terrain_id = cursor.lastrowid
        print(f"Created terrain with ID: {terrain_id}")
        
        # 3. Manually create quadrants for this terrain (since we're bypassing the ORM)
        print("Creating quadrants for terrain...")
        ROWS = ["A", "B", "C"]
        COLS = ["1", "2", "3", "4", "5"]
        quadrants_created = 0
        
        for r in ROWS:
            for c in COLS:
                label = f"{r}{c}"
                cursor.execute(
                    "INSERT INTO quadrants (terrain_id, label, soil_moisture, fertility, coverage, organic_matter, compaction, biodiversity) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (terrain_id, label, 0.0, 0, 0.0, 0, 0, 0)
                )
                quadrants_created += 1
        
        conn.commit()
        print(f"Created {quadrants_created} quadrants for the terrain")
        
        # Get the first quadrant of this terrain
        cursor.execute("SELECT id, label FROM quadrants WHERE terrain_id = ? LIMIT 1", (terrain_id,))
        quadrant = cursor.fetchone()
        if not quadrant:
            print("ERROR: No quadrants found for this terrain after creation.")
            return False
        
        quadrant_id = quadrant['id']
        quadrant_label = quadrant['label']
        print(f"Using quadrant with ID: {quadrant_id}, label: {quadrant_label}")
        
        # 4. Create a planting in slot 1
        try:
            cursor.execute(
                "INSERT INTO plantings (species_id, player_id, quadrant_id, slot_index) VALUES (?, ?, ?, ?)",
                (1, player_id, quadrant_id, 1)
            )
            conn.commit()
            planting1_id = cursor.lastrowid
            print(f"Created planting in slot 1 with ID: {planting1_id}")
        except sqlite3.IntegrityError as e:
            print(f"ERROR: Could not create planting in slot 1: {e}")
            return False
        
        # 5. Create another planting in slot 2
        try:
            cursor.execute(
                "INSERT INTO plantings (species_id, player_id, quadrant_id, slot_index) VALUES (?, ?, ?, ?)",
                (1, player_id, quadrant_id, 2)
            )
            conn.commit()
            planting2_id = cursor.lastrowid
            print(f"Created planting in slot 2 with ID: {planting2_id}")
        except sqlite3.IntegrityError as e:
            print(f"ERROR: Could not create planting in slot 2: {e}")
            return False
        
        # 6. Try to create a planting in slot 1 again (should fail due to uniqueness constraint)
        try:
            cursor.execute(
                "INSERT INTO plantings (species_id, player_id, quadrant_id, slot_index) VALUES (?, ?, ?, ?)",
                (1, player_id, quadrant_id, 1)
            )
            conn.commit()
            print("ERROR: Was able to create a duplicate planting in slot 1")
            return False
        except sqlite3.IntegrityError as e:
            print(f"SUCCESS: Correctly prevented duplicate planting in slot 1: {e}")
        
        # 7. Get all plantings for this quadrant
        cursor.execute(
            "SELECT id, slot_index FROM plantings WHERE quadrant_id = ?",
            (quadrant_id,)
        )
        quadrant_plantings = cursor.fetchall()
        
        if len(quadrant_plantings) != 2:
            print(f"ERROR: Expected 2 plantings in quadrant, got {len(quadrant_plantings)}")
            return False
        
        # 8. Verify slot indexes
        slot_indexes = [p['slot_index'] for p in quadrant_plantings]
        if 1 not in slot_indexes or 2 not in slot_indexes:
            print(f"ERROR: Expected slots 1 and 2, got {slot_indexes}")
            return False
            
        print("All direct tests passed! The planting slots implementation works correctly at the database level.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"ERROR during test: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = test_planting_slots()
    print(f"Test result: {'Success' if success else 'Failure'}")
    sys.exit(0 if success else 1)
