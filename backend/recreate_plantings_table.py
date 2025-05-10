"""
Script to drop and recreate the plantings table with the new schema.
"""
import sqlite3
import os
import sys

def recreate_plantings_table():
    """Drop and recreate the plantings table with the new schema."""
    print("Starting recreation of plantings table...")
    
    # Connect to the database
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "db.sqlite3"))
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if plantings table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='plantings'")
        if cursor.fetchone():
            print("Dropping existing plantings table...")
            cursor.execute("DROP TABLE IF EXISTS plantings")
        
        # Create the plantings table with updated schema
        print("Creating plantings table with new schema...")
        cursor.execute("""
        CREATE TABLE plantings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            species_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            quadrant_id INTEGER NOT NULL,
            slot_index INTEGER NOT NULL,
            planted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            current_state VARCHAR(20) DEFAULT 'SEMENTE' NOT NULL,
            days_since_planting INTEGER DEFAULT 0,
            days_sem_rega INTEGER DEFAULT 0,
            FOREIGN KEY (species_id) REFERENCES species(id),
            FOREIGN KEY (player_id) REFERENCES players(id),
            FOREIGN KEY (quadrant_id) REFERENCES quadrants(id),
            UNIQUE (quadrant_id, slot_index)
        )
        """)
        
        # Create indexes for better performance
        print("Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_plantings_species_id ON plantings (species_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_plantings_player_id ON plantings (player_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_plantings_quadrant_id ON plantings (quadrant_id)")
        
        # Commit the changes
        conn.commit()
        print("Plantings table recreated successfully!")
        return True
    
    except Exception as e:
        conn.rollback()
        print(f"Error during recreation: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = recreate_plantings_table()
    sys.exit(0 if success else 1)
