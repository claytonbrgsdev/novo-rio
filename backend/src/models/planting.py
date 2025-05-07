from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base

# Enum values for planting states
plant_state_enum = SQLEnum(
    'SEMENTE', 'MUDINHA', 'MADURA', 'COLHIVEL', 'COLHIDA', 'MORTA',
    name='plant_state', create_type=True
)

class Planting(Base):
    __tablename__ = 'plantings'

    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, ForeignKey('species.id'), nullable=False)
    player_id = Column(Integer, ForeignKey('players.id'), nullable=False)
    planted_at = Column(DateTime(timezone=True), server_default=func.now())
    current_state = Column(plant_state_enum, nullable=False, default='SEMENTE')
    days_since_planting = Column(Integer, default=0)
    days_sem_rega = Column(Integer, default=0)

    # Relationships
    species = relationship('Species', back_populates='plantings')
    player = relationship('Player', back_populates='plantings')
    logs = relationship('PlantStateLog', back_populates='planting')
