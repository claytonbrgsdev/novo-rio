from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker
import os

Base = declarative_base()

# Obter URL do banco de dados do ambiente
_db_url = os.getenv("DATABASE_URL")

# Sync engine and session factory - adicionado para endpoints síncronos
# Usar mesma URL que async, convertendo se necessário
if not _db_url:
    DATABASE_URL = "sqlite:///./test.db"
elif _db_url.startswith("sqlite+aiosqlite"):
    DATABASE_URL = "sqlite:///" + _db_url[17:]  # remove sqlite+aiosqlite://
elif _db_url.startswith("postgresql+asyncpg"):
    DATABASE_URL = "postgresql://" + _db_url[19:]  # remove postgresql+asyncpg://
else:
    DATABASE_URL = _db_url
    
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for sync endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async engine and session factory
if not _db_url:
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
elif _db_url.startswith("sqlite+aiosqlite"):
    ASYNC_DATABASE_URL = _db_url
elif _db_url.startswith("sqlite:///"):
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///" + _db_url[10:]
else:
    ASYNC_DATABASE_URL = _db_url  # outros bancos: adapte conforme necessário
async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False})
AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

def get_async_db():
    """Dependency for async endpoints."""
    async def _get_db():
        async with AsyncSessionLocal() as session:
            yield session
    return _get_db

def build_engine(url, poolclass=None):
    kwargs = {"connect_args": {"check_same_thread": False}}
    if poolclass:
        kwargs["poolclass"] = poolclass
    return create_engine(url, **kwargs)

def build_session(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db_override(SessionLocal):
    def _get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    return _get_db
