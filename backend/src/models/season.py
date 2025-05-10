"""
Modelo para representar as estações do ano e seus efeitos.
"""
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from ..db import Base
from enum import Enum

class SeasonType(str, Enum):
    """Enum representando os tipos de estações do ano."""
    VERAO = "verão"
    OUTONO = "outono"
    INVERNO = "inverno"
    PRIMAVERA = "primavera"

class Season(Base):
    """Modelo para representar a estação atual do sistema."""
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # Verão, Outono, Inverno, Primavera
    description = Column(String, nullable=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Fatores de ajuste para a estação
    soil_moisture_factor = Column(Float, default=1.0)  # Multiplicador para umidade do solo
    organic_matter_factor = Column(Float, default=1.0)  # Multiplicador para matéria orgânica
    biodiversity_factor = Column(Float, default=1.0)    # Multiplicador para biodiversidade
    fertility_factor = Column(Float, default=1.0)       # Multiplicador para fertilidade
    germination_factor = Column(Float, default=1.0)     # Multiplicador para tempo de germinação
    maturation_factor = Column(Float, default=1.0)      # Multiplicador para tempo de maturação
