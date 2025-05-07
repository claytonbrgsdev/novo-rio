from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base


class PlantStateLog(Base):
    __tablename__ = 'plant_state_logs'

    id = Column(Integer, primary_key=True, index=True)
    planting_id = Column(Integer, ForeignKey('plantings.id'), nullable=False)
    from_state = Column(String, nullable=False)
    to_state = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to planting
    planting = relationship('Planting', back_populates='logs')
