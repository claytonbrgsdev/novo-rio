"""
Script to create all necessary tables for the planting slots implementation.
Execute this from the root backend directory.
"""
import os
import sys

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.db import engine, Base
# Ensure all models are imported so they are registered with Base
from src.models.quadrant import Quadrant
from src.models.planting import Planting

def create_tables():
    """
    Create all necessary tables for the application.
    """
    print("Creating/updating database tables...")
    try:
        # Create tables based on SQLAlchemy models
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

if __name__ == "__main__":
    success = create_tables()
    sys.exit(0 if success else 1)
