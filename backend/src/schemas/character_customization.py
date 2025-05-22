"""
Pydantic models for character customization API endpoints.

These schemas define the structure of the data returned by the
character customization endpoints.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class HeadBase(BaseModel):
    """Base schema for head options."""
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class HeadCreate(HeadBase):
    """Schema for creating a new head option."""
    pass

class HeadOut(HeadBase):
    """Schema for returning head options."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class BodyBase(BaseModel):
    """Base schema for body options."""
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class BodyCreate(BodyBase):
    """Schema for creating a new body option."""
    pass

class BodyOut(BodyBase):
    """Schema for returning body options."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ToolBase(BaseModel):
    """Base schema for tools."""
    key: str
    common_name: str
    description: str
    task_type: str
    efficiency: float
    durability: int
    compatible_with: List[str]
    effects: Dict[str, Any]
    image_url: Optional[str] = None

class ToolCreate(ToolBase):
    """Schema for creating a new tool."""
    pass

class ToolOut(ToolBase):
    """Schema for returning tool options."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
