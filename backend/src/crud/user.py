from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from typing import Optional, List

from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


def create_user(db: Session, user: UserCreate) -> User:
    """
    Cria um novo usuário.
    """
    hashed_password = User.hash_password(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        player_id=user.player_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Busca um usuário pelo ID.
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Busca um usuário pelo email.
    """
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Lista usuários com paginação.
    """
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Atualiza um usuário existente.
    """
    db_user = get_user(db, user_id)
    if db_user is None:
        return None
    
    # Atualizar campos
    update_data = user_update.dict(exclude_unset=True)
    
    # Se a senha estiver sendo atualizada, precisamos hashear
    if "password" in update_data:
        update_data["hashed_password"] = User.hash_password(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Remove um usuário.
    """
    db_user = get_user(db, user_id)
    if db_user is None:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


def validate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Valida o email e senha de um usuário para autenticação.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not user.verify_password(password):
        return None
    
    # Atualiza o último login
    user.last_login = datetime.now()
    db.commit()
    
    return user


# Versões assíncronas das funções acima

async def create_user_async(db: AsyncSession, user: UserCreate) -> User:
    """
    Cria um novo usuário (versão assíncrona).
    """
    hashed_password = User.hash_password(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        player_id=user.player_id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_user_async(db: AsyncSession, user_id: int) -> Optional[User]:
    """
    Busca um usuário pelo ID (versão assíncrona).
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()


async def get_user_by_email_async(db: AsyncSession, email: str) -> Optional[User]:
    """
    Busca um usuário pelo email (versão assíncrona).
    """
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()


async def get_users_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Lista usuários com paginação (versão assíncrona).
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


async def update_user_async(db: AsyncSession, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Atualiza um usuário existente (versão assíncrona).
    """
    db_user = await get_user_async(db, user_id)
    if db_user is None:
        return None
    
    # Atualizar campos
    update_data = user_update.dict(exclude_unset=True)
    
    # Se a senha estiver sendo atualizada, precisamos hashear
    if "password" in update_data:
        update_data["hashed_password"] = User.hash_password(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user_async(db: AsyncSession, user_id: int) -> bool:
    """
    Remove um usuário (versão assíncrona).
    """
    db_user = await get_user_async(db, user_id)
    if db_user is None:
        return False
    
    await db.delete(db_user)
    await db.commit()
    return True


async def validate_user_async(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    Valida o email e senha de um usuário para autenticação (versão assíncrona).
    """
    user = await get_user_by_email_async(db, email)
    if not user:
        return None
    
    if not user.verify_password(password):
        return None
    
    # Atualiza o último login
    user.last_login = datetime.now()
    await db.commit()
    
    return user
