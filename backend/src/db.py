from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

SYNC_DATABASE_URL = DATABASE_URL
ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

# Sync Engine and Session
engine = create_engine(SYNC_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

    async def get_async_db():
        engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False})
        AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
        async with AsyncSessionLocal() as session:
            yield session
except ImportError:
    # Async support not available: define placeholder
    def get_async_db():
        raise RuntimeError("Async support not available. Please install 'aiosqlite'.")
