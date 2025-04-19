from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    # TODO: adicionar outros campos (email, phone, etc.)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    actions = relationship("Action", back_populates="player")
    items = relationship("Item", back_populates="player")
    badges = relationship("Badge", back_populates="player")
    terrains = relationship("Terrain", back_populates="player")
    purchases = relationship("Purchase", back_populates="player")
