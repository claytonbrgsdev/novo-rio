from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    player_id: Optional[int] = None


class UserLogin(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    player_id: Optional[int] = None

    @validator('password')
    def password_must_be_at_least_6_chars(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        return v


class UserOut(UserBase):
    id: int
    is_active: bool
    player_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    player_id: Optional[int] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
