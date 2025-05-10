"""
Script to set up the test database for the planting slots testing.
"""
import os
import sqlite3
import sys

def setup_test_database():
    """Set up the test database with all necessary tables and seed data."""
    print("Setting up test database...")
    
    # Connect to the test database
    test_db_path = os.path.join(os.path.dirname(__file__), "test.db")
    print(f"Using test database at: {test_db_path}")
    
    # Remove existing database if it exists
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
        print("Removed existing test database")
    
    # Create new database connection
    conn = sqlite3.connect(test_db_path)
    cursor = conn.cursor()
    
    try:
        # Create players table
        cursor.execute("""
        CREATE TABLE players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            balance FLOAT NOT NULL DEFAULT 0.0,
            aura FLOAT NOT NULL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            cycle_start TIMESTAMP,
            actions_count INTEGER NOT NULL DEFAULT 0
        )
        """)
        
        # Create species table
        cursor.execute("""
        CREATE TABLE species (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(50) UNIQUE NOT NULL,
            common_name VARCHAR(100) NOT NULL,
            germinacao_dias INTEGER NOT NULL,
            maturidade_dias INTEGER NOT NULL,
            agua_diaria_min FLOAT NOT NULL,
            espaco_m2 FLOAT NOT NULL,
            rendimento_unid INTEGER NOT NULL,
            tolerancia_seca VARCHAR(20) NOT NULL
        )
        """)
        
        # Create terrains table
        cursor.execute("""
        CREATE TABLE terrains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            x_coordinate FLOAT NOT NULL,
            y_coordinate FLOAT NOT NULL,
            access_type VARCHAR(20) NOT NULL DEFAULT 'public',
            FOREIGN KEY (player_id) REFERENCES players(id)
        )
        """)
        
        # Create quadrants table
        cursor.execute("""
        CREATE TABLE quadrants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            terrain_id INTEGER NOT NULL,
            label VARCHAR(10) NOT NULL,
            soil_moisture FLOAT NOT NULL DEFAULT 0.0,
            fertility INTEGER NOT NULL DEFAULT 0,
            coverage FLOAT NOT NULL DEFAULT 0.0,
            organic_matter INTEGER NOT NULL DEFAULT 0,
            compaction INTEGER NOT NULL DEFAULT 0,
            biodiversity INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (terrain_id) REFERENCES terrains(id)
        )
        """)
        
        # Create plantings table with the new fields
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
        
        # Add indexes for better performance
        cursor.execute("CREATE INDEX idx_plantings_player_id ON plantings(player_id)")
        cursor.execute("CREATE INDEX idx_plantings_species_id ON plantings(species_id)")
        cursor.execute("CREATE INDEX idx_plantings_quadrant_id ON plantings(quadrant_id)")
        cursor.execute("CREATE INDEX idx_terrains_player_id ON terrains(player_id)")
        cursor.execute("CREATE INDEX idx_quadrants_terrain_id ON quadrants(terrain_id)")
        
        # Add test species
        cursor.execute("""
        INSERT INTO species (key, common_name, germinacao_dias, maturidade_dias, 
                             agua_diaria_min, espaco_m2, rendimento_unid, tolerancia_seca)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("test_species_1", "Test Species 1", 7, 30, 2.5, 1.0, 10, "média"))
        
        conn.commit()
        print("Test database setup completed successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Error setting up test database: {e}")
        return False
        
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = setup_test_database()
    sys.exit(0 if success else 1)
