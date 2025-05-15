from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..db import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserOut, Token
from ..crud.user import create_user, get_user_by_email, validate_user
from ..auth.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

router = APIRouter(prefix="/auth", tags=["autenticação"])

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário.
    """
    # Verificar se o email já está em uso
    db_user = get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    # Criar o usuário
    return create_user(db, user_in)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Autentica um usuário e retorna um token de acesso.
    """
    user = validate_user(db, form_data.username, form_data.password)
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
async def login_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint alternativo para autenticação (compatível com oauth2_scheme).
    """
    return await login(form_data, db)

@router.get("/validate")
async def validate_token(current_user: User = Depends(get_current_user)):
    """
    Valida o token JWT atual e retorna as informações do usuário.
    Retorna um erro 401 se o token for inválido ou estiver expirado.
    """
    return {
        "status": "ok", 
        "id": current_user.id,  # Alterado para retornar 'id' em vez de 'user_id'
        "email": current_user.email,
        "player_id": current_user.player_id
    }

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Retorna informações detalhadas do usuário autenticado atual.
    Usada pelo frontend para obter dados do usuário após autenticação.
    """
    return current_user
