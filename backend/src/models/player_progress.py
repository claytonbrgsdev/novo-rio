from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base


class PlayerProgress(Base):
    """Model representing player game progress."""
    __tablename__ = "player_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, unique=True, index=True)
    level = Column(Integer, nullable=False, default=1)
    score = Column(Integer, nullable=False, default=0)
    coins = Column(Integer, nullable=False, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_played_at = Column(DateTime(timezone=True), server_default=func.now())
