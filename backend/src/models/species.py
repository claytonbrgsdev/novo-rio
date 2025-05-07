from sqlalchemy import Column, Integer, String, Float
from ..db import Base
from sqlalchemy.orm import relationship


class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    common_name = Column(String, nullable=False)
    germinacao_dias = Column(Integer, nullable=False)
    maturidade_dias = Column(Integer, nullable=False)
    agua_diaria_min = Column(Float, nullable=False)
    espaco_m2 = Column(Float, nullable=False)
    rendimento_unid = Column(Integer, nullable=False)
    tolerancia_seca = Column(String, nullable=False)
    # Relationship to plantings
    plantings = relationship("Planting", back_populates="species")
