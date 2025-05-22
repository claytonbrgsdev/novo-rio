from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from ..db import Base

class Body(Base):
    """
    Model representing character body options.
    """
    __tablename__ = "bodies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Body {self.name}>"
