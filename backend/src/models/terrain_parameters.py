from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base

class TerrainParameters(Base):
    __tablename__ = "terrain_parameters"

    id = Column(Integer, primary_key=True, index=True)
    terrain_id = Column(Integer, ForeignKey("terrains.id"), nullable=False, index=True)
    coverage = Column(Float, default=0)
    regeneration_cycles = Column(Integer, default=0)
    soil_moisture = Column(Float, default=0)
    fertility = Column(Integer, default=0)
    soil_ph = Column(Float, default=7.0)
    organic_matter = Column(Integer, default=0)
    compaction = Column(Integer, default=0)
    biodiversity = Column(Integer, default=0)
    spontaneous_species_count = Column(Integer, default=0)

    # Relationship
    terrain = relationship("Terrain", back_populates="terrain_params")
