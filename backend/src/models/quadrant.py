from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base

class Quadrant(Base):
    __tablename__ = "quadrants"

    id = Column(Integer, primary_key=True, index=True)
    terrain_id = Column(Integer, ForeignKey("terrains.id"), nullable=False, index=True)
    label = Column(String, nullable=False)  # Values like "A1", "B3", "C5", etc.
    
    # Health fields
    soil_moisture = Column(Float, default=0.0)
    fertility = Column(Integer, default=0)
    coverage = Column(Float, default=0.0)
    organic_matter = Column(Integer, default=0)
    compaction = Column(Integer, default=0)
    biodiversity = Column(Integer, default=0)
    
    # Relationships
    terrain = relationship("Terrain", back_populates="quadrants")
    plantings = relationship("Planting", back_populates="quadrant", cascade="all, delete-orphan")
    
    # Ensure label is unique per terrain
    __table_args__ = (
        # SQLAlchemy unique constraint across terrain_id and label
        # This ensures each terrain has unique quadrant labels
        {'sqlite_autoincrement': True},
    )
