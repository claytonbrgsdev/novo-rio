from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.dialects.sqlite import JSON
from ..db import Base

class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    common_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    task_type = Column(String, nullable=False)
    efficiency = Column(Float, nullable=False)
    durability = Column(Integer, nullable=False)
    compatible_with = Column(JSON, nullable=False)  # lista de strings
    effects = Column(JSON, nullable=False)          # dict de efeitos