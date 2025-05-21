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
    BYPASS: Sempre autentica o usuário e retorna um token de acesso de debug.
    """
    print(f"DEBUG: Login attempt bypassed for {form_data.username}")
    
    # Try to get a real user if possible
    try:
        # First try by email
        user = get_user_by_email(db, form_data.username)
        if not user and form_data.username == "debug@example.com":
            # If we're using the debug email and user doesn't exist, try to get user with ID 1
            user = get_user(db, 1)
    except Exception as e:
        print(f"DEBUG: Error getting user: {e}")
        user = None
    
    # If no user found, create a dummy response
    if not user:
        print("DEBUG: Using dummy login response")
        return {
            "access_token": "debug_token_bypass_authentication",
            "token_type": "bearer",
            "player_id": 1  # Assuming player ID 1 exists or will be created
        }
    
    # Using real user but with debug token
    print(f"DEBUG: Using real user for login: ID={user.id}, email={user.email}")
    return {
        "access_token": "debug_token_bypass_authentication",
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
    BYPASS: Sempre valida o token e retorna informações do usuário de debug.
    """
    print("DEBUG: /auth/validate endpoint called - authentication bypass enabled")
    return {
        "status": "ok", 
        "id": current_user.id,
        "email": current_user.email,
        "player_id": current_user.player_id
    }

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    BYPASS: Retorna informações do usuário de debug.
    Usada pelo frontend para obter dados do usuário após autenticação.
    """
    print(f"DEBUG: /auth/me endpoint called - returning user: ID={current_user.id}, email={current_user.email}")
    return current_user
