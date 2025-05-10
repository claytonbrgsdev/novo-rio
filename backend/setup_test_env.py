"""
Script to set up the test environment with all necessary tables and relationships.
"""
import os
import sys
import logging

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.db import engine, Base
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.models.species import Species

def setup_test_environment():
    """
    Create all necessary tables for testing.
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Creating test database tables...")
        
        # Create all tables based on SQLAlchemy models
        Base.metadata.create_all(bind=engine)
        
        logger.info("Tables created successfully!")
        
        # Optionally add some seed data for testing
        from sqlalchemy.orm import Session
        with Session(engine) as session:
            # Check if we have any species
            species = session.query(Species).first()
            if not species:
                logger.info("Adding seed species...")
                seed_species = [
                    Species(
                        key="test_species_1",
                        common_name="Test Species 1",
                        germinacao_dias=7,
                        maturidade_dias=30,
                        agua_diaria_min=2.5,
                        espaco_m2=1.0,
                        rendimento_unid=10,
                        tolerancia_seca="média"
                    ),
                    Species(
                        key="test_species_2",
                        common_name="Test Species 2",
                        germinacao_dias=10,
                        maturidade_dias=45,
                        agua_diaria_min=3.0,
                        espaco_m2=1.5,
                        rendimento_unid=8,
                        tolerancia_seca="baixa"
                    )
                ]
                session.add_all(seed_species)
                session.commit()
        
        return True
    except Exception as e:
        logger.error(f"Error setting up test environment: {e}")
        return False

if __name__ == "__main__":
    success = setup_test_environment()
    sys.exit(0 if success else 1)
