from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    aura = Column(Float, default=100.0)
    # TODO: adicionar outros campos (email, phone, etc.)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 6-hour action cycle fields
    cycle_start = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actions_count = Column(Integer, default=0, nullable=False)

    # Relacionamentos
    actions = relationship("Action", back_populates="player")
    items = relationship("Item", back_populates="player")
    badges = relationship("Badge", back_populates="player")
    terrains = relationship("Terrain", back_populates="player")
    purchases = relationship("Purchase", back_populates="player")
    plantings = relationship("Planting", back_populates="player")
