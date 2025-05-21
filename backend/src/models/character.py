from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base


class Character(Base):
    """
    Model representing player character customizations.
    """
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    head_id = Column(Integer, nullable=False)
    body_id = Column(Integer, nullable=False)
    tool_id = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship back to the player
    player = relationship("Player", back_populates="characters")
