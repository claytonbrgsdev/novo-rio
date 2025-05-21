from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from fastapi.concurrency import run_in_threadpool

from ..db import get_async_db
from ..models.user import User
from ..schemas.user import UserCreate, UserOut, Token
from ..crud.user import create_user_async, get_user_by_email_async, validate_user_async
from ..auth.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/async/auth", tags=["autenticação"])

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_async_db)):
    """
    Registra um novo usuário (versão assíncrona).
    """
    # Verificar se o email já está em uso
    db_user = await get_user_by_email_async(db, user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    # Criar o usuário
    return await create_user_async(db, user_in)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    """
    Autentica um usuário e retorna um token de acesso (versão assíncrona).
    """
    user = await validate_user_async(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "player_id": user.player_id
    }

@router.post("/token", response_model=Token)
async def login_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    """
    Endpoint alternativo para autenticação (compatível com oauth2_scheme, versão assíncrona).
    """
    return await login(form_data, db)
