from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base

class Terrain(Base):
    __tablename__ = "terrains"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    # relacionamento com jogador
    player = relationship("Player", back_populates="terrains")
    name = Column(String, nullable=True)
    x_coordinate = Column(Float, nullable=True)
    y_coordinate = Column(Float, nullable=True)
    access_type = Column(String, nullable=True)

    quadrants_width = Column(Integer, default=1)
    quadrants_height = Column(Integer, default=1)
    shape = Column(String, nullable=True)
    scale_size = Column(String, nullable=True)
    altitude = Column(Float, nullable=True)
    slope = Column(String, nullable=True)
    has_spring = Column(Boolean, default=False)
    has_vereda = Column(Boolean, default=False)

    climate_type = Column(String, nullable=True)
    rainfall_frequency = Column(Float, nullable=True)
    dryness_frequency = Column(Float, nullable=True)
    fire_risk = Column(Float, nullable=True)

    status = Column(String, nullable=True)
    status_color = Column(String, nullable=True)
    microclimate = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    actions = relationship("Action", back_populates="terrain")
    terrain_params = relationship("TerrainParameters", back_populates="terrain")
