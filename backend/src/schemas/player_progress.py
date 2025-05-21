from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class PlayerProgressBase(BaseModel):
    """Base schema for player game progress data."""
    user_id: str
    level: int
    score: int
    coins: int


class PlayerProgressCreate(PlayerProgressBase):
    """Schema for creating player game progress."""
    pass


class PlayerProgressUpdate(BaseModel):
    """Schema for updating player game progress."""
    level: Optional[int] = None
    score: Optional[int] = None
    coins: Optional[int] = None
    last_played_at: Optional[datetime] = None


class PlayerProgressOut(PlayerProgressBase):
    """Schema for player game progress output."""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_played_at: Optional[datetime] = None

    class Config:
        orm_mode = True
