from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import base64
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.user import User
from ..crud.user import get_user_by_email, get_user

# Configuração do JWT
SECRET_KEY = "NOVO_RIO_LOCAL_SECRET_KEY_CHANGE_IN_PRODUCTION"  # Chave secreta para assinatura do JWT
ALGORITHM = "HS256"  # Algoritmo de assinatura do JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # Token expira em 7 dias

# Esquema de autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token simplificado baseado em HMAC
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire.timestamp()})
    
    # Convertemos para JSON e depois para base64
    message = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode()
    
    # Assinamos com HMAC
    signature = hmac.new(
        SECRET_KEY.encode(), 
        message.encode(), 
        hashlib.sha256
    ).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode()
    
    # Formato: mensagem.assinatura
    return f"{message}.{signature_b64}"

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodifica um token simplificado
    """
    try:
        # Separamos a mensagem da assinatura
        message, signature = token.split('.')
        
        # Verificamos a assinatura
        expected_signature = hmac.new(
            SECRET_KEY.encode(), 
            message.encode(), 
            hashlib.sha256
        ).digest()
        received_signature = base64.urlsafe_b64decode(signature)
        
        if not hmac.compare_digest(expected_signature, received_signature):
            raise ValueError("Assinatura inválida")
        
        # Decodificamos a mensagem
        payload = json.loads(base64.urlsafe_b64decode(message).decode())
        
        # Verificamos a expiração
        exp = payload.get("exp")
        if exp and exp < time.time():
            raise ValueError("Token expirado")
            
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido ou expirado: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    BYPASS: Retorna um usuário de depuração sem verificar o token.
    """
    print("WARNING: Authentication bypass active. Using debug user.")
    
    # Try to get a real user for debugging if it exists
    try:
        user = get_user(db, 1)  # Try to get user with ID 1
        if user:
            print(f"DEBUG: Using existing user ID={user.id}, email={user.email}")
            return user
    except Exception as e:
        print(f"DEBUG: Error getting existing user: {e}")
    
    # If no real user exists, create a dummy User object
    # This is not saved to the database, just returned for this request
    from ..models.user import User
    dummy_user = User(id=1, email="debug@example.com", is_active=True)
    print(f"DEBUG: Using dummy user ID={dummy_user.id}, email={dummy_user.email}")
    
    return dummy_user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verifica se o usuário atual está ativo.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo",
        )
    
    return current_user
