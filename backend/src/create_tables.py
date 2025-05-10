"""
Script to create all necessary tables for the planting slots implementation.
"""
import os
import sys

# We're already in the src directory, so imports should be relative
from db import engine, Base
from models.quadrant import Quadrant
from models.planting import Planting

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
