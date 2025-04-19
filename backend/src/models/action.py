from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base

class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    terrain_id = Column(Integer, ForeignKey("terrains.id"), nullable=False, index=True)
    action_name = Column(String, nullable=False)
    sub_action = Column(String, nullable=True)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    player = relationship("Player", back_populates="actions")
    terrain = relationship("Terrain", back_populates="actions")
