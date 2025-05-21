from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CharacterBase(BaseModel):
    """Base schema for character data."""
    name: str
    head_id: int
    body_id: int
    tool_id: str


class CharacterCreate(CharacterBase):
    """Schema for creating a new character."""
    pass


class CharacterUpdate(BaseModel):
    """Schema for updating an existing character."""
    name: Optional[str] = None
    head_id: Optional[int] = None
    body_id: Optional[int] = None
    tool_id: Optional[str] = None


class CharacterOut(CharacterBase):
    """Schema for character output (response)."""
    id: int
    player_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
