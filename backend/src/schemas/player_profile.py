from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class PlayerProfileBase(BaseModel):
    """Base schema for player profile data."""
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    game_data: Optional[dict] = None


class PlayerProfileCreate(PlayerProfileBase):
    """Schema for creating a player profile."""
    pass


class PlayerProfileUpdate(BaseModel):
    """Schema for updating a player profile."""
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    game_data: Optional[dict] = None
    last_login: Optional[datetime] = None


class PlayerProfileOut(PlayerProfileBase):
    """Schema for player profile output."""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True
