from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base


class Input(Base):
    """
    Model representing agricultural inputs/resources applied to plantings.
    These can be water, fertilizer, compost, etc.
    """
    __tablename__ = "inputs"

    id = Column(Integer, primary_key=True, index=True)
    planting_id = Column(Integer, ForeignKey("plantings.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # água, fertilizante, composto, etc.
    quantity = Column(Float, nullable=False)
    applied_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationship back to the planting
    planting = relationship("Planting", back_populates="inputs")
