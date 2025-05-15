#!/usr/bin/env python
"""
Seed script para criar dados iniciais no banco de dados para desenvolvimento.
Cria um usuário "seeded@user.com" com senha "password".
"""

import sys
import os
import asyncio
from pathlib import Path

# Adiciona o diretório raiz do projeto ao sys.path para poder importar os módulos do backend
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

from src.db import AsyncSessionLocal
from src.models.user import User
from src.models.character import Character
from src.app import settings

async def create_user(db: AsyncSession):
    """
    Cria um usuário de teste se ele não existir.
    """
    # Verifica se o usuário já existe
    existing_user = await db.get(User, "seeded@user.com")
    
    if existing_user:
        print(f"Usuário seeded@user.com já existe (ID: {existing_user.id})")
        return existing_user
    
    # Cria um novo usuário
    new_user = User(
        email="seeded@user.com",
        hashed_password=User.hash_password("password"),
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    print(f"Usuário seeded@user.com criado com sucesso (ID: {new_user.id})")
    return new_user

async def create_character(db: AsyncSession, user_id: str):
    """
    Cria um personagem para o usuário de teste.
    """
    # Verifica se o personagem já existe
    existing_character = await db.query(Character).filter(Character.user_id == user_id).first()
    
    if existing_character:
        print(f"Personagem para usuário {user_id} já existe (ID: {existing_character.id})")
        return existing_character
    
    # Cria um novo personagem
    new_character = Character(
        user_id=user_id,
        strength=5,
        agility=5,
        wisdom=5,
        charisma=5,
        avatar_type="default",
        avatar_customization={"hair": "short", "skin": "medium", "clothes": "casual"}
    )
    
    db.add(new_character)
    await db.commit()
    await db.refresh(new_character)
    
    print(f"Personagem para usuário {user_id} criado com sucesso (ID: {new_character.id})")
    return new_character

async def seed_database():
    """
    Função principal para semear o banco de dados.
    """
    print(f"Iniciando seed do banco de dados")
    
    async with AsyncSessionLocal() as session:
        # Criar usuário de teste
        user = await create_user(session)
        
        # Criar personagem para o usuário
        character = await create_character(session, user.id)
        
        # Aqui você pode adicionar mais dados de seed conforme necessário
        # Por exemplo: terrenos, plantas, configurações iniciais, etc.
        
    print("Seed concluído com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_database())
