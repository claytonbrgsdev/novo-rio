"""
Script to update the database schema with the new quadrant_id and slot_index columns in the plantings table.
"""
import sqlite3
import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

def run_migration():
    """
    Add new columns to the plantings table and create the necessary unique constraint.
    """
    print("Starting migration to add quadrant_id and slot_index to plantings table...")
    
    # Connect to the database
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "db.sqlite3"))
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(plantings)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        # Add quadrant_id column if it doesn't exist
        if "quadrant_id" not in column_names:
            print("Adding quadrant_id column to plantings table...")
            cursor.execute("ALTER TABLE plantings ADD COLUMN quadrant_id INTEGER REFERENCES quadrants(id)")
        else:
            print("quadrant_id column already exists.")
        
        # Add slot_index column if it doesn't exist
        if "slot_index" not in column_names:
            print("Adding slot_index column to plantings table...")
            cursor.execute("ALTER TABLE plantings ADD COLUMN slot_index INTEGER")
        else:
            print("slot_index column already exists.")
        
        # Create index for better performance
        print("Creating index on quadrant_id...")
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_plantings_quadrant_id ON plantings (quadrant_id)")
        except sqlite3.OperationalError as e:
            print(f"Notice: {e}")
        
        # Create unique constraint
        print("Creating unique constraint on quadrant_id and slot_index...")
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uix_quadrant_slot ON plantings (quadrant_id, slot_index)")
        except sqlite3.OperationalError as e:
            print(f"Notice: {e}")
        
        # Commit the changes
        conn.commit()
        print("Migration completed successfully!")
        return True
    
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
