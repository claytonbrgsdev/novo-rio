from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base


class PlayerSettings(Base):
    """Model representing player game settings."""
    __tablename__ = "player_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, unique=True, index=True)
    theme = Column(String, nullable=False, default="light")
    volume = Column(Float, nullable=False, default=0.7)
    music_volume = Column(Float, nullable=False, default=0.5)
    sfx_volume = Column(Float, nullable=False, default=0.8)
    language = Column(String, nullable=False, default="pt-BR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
