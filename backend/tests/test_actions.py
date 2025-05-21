import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Async engine and session factory
ASYNC_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
# Garante que o driver correto seja usado para cada tipo de database
if ASYNC_DATABASE_URL.startswith('sqlite:///'):
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.replace('sqlite:///', 'sqlite+aiosqlite:///')
elif ASYNC_DATABASE_URL.startswith('postgresql:'):
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')
# Cria async_engine com configurações apropriadas para o banco de dados
if ASYNC_DATABASE_URL.startswith('sqlite'):
    async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    async_engine = create_async_engine(ASYNC_DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_db():
    """Dependency for async endpoints."""
    async with AsyncSessionLocal() as session:
        yield session