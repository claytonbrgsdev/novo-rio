from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel


class PlayerSettingsBase(BaseModel):
    """Base schema for player settings data."""
    user_id: str
    theme: Literal["light", "dark", "system"]
    volume: float
    music_volume: float
    sfx_volume: float
    language: str


class PlayerSettingsCreate(PlayerSettingsBase):
    """Schema for creating player settings."""
    pass


class PlayerSettingsUpdate(BaseModel):
    """Schema for updating player settings."""
    theme: Optional[Literal["light", "dark", "system"]] = None
    volume: Optional[float] = None
    music_volume: Optional[float] = None
    sfx_volume: Optional[float] = None
    language: Optional[str] = None


class PlayerSettingsOut(PlayerSettingsBase):
    """Schema for player settings output."""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
