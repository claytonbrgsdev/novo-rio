from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker
import os
import asyncio
from contextvars import ContextVar

# Context variable to store event loop for each thread
_asyncio_event_loop = ContextVar('asyncio_event_loop', default=None)

Base = declarative_base()

# Get database URL from environment
_db_url = os.getenv("DATABASE_URL")

# Sync engine and session factory for sync endpoints
if not _db_url:
    DATABASE_URL = "sqlite:///./test.db"
elif _db_url.startswith("postgresql"):
    # For PostgreSQL, use psycopg2 for sync
    DATABASE_URL = _db_url
else:
    DATABASE_URL = _db_url

# Create sync engine with appropriate connection args
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for sync endpoints.
    Ensure that we have an event loop for each thread.
    """
    # Ensure we have an event loop for this thread
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        # If there's no loop, create one and store it
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        _asyncio_event_loop.set(loop)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async engine and session factory
if not _db_url:
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
elif _db_url == "sqlite:///:memory:":
    # Special case for in-memory SQLite
    ASYNC_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
elif _db_url.startswith("sqlite://"):
    # For SQLite, use aiosqlite
    ASYNC_DATABASE_URL = _db_url.replace("sqlite://", "sqlite+aiosqlite://")
elif _db_url.startswith("postgresql"):
    # For PostgreSQL, use asyncpg
    ASYNC_DATABASE_URL = _db_url.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = _db_url

# Create async engine with appropriate connection args
if ASYNC_DATABASE_URL.startswith("sqlite+aiosqlite"):
    if ":memory:" in ASYNC_DATABASE_URL:
        # In-memory SQLite needs no connect_args
        async_engine = create_async_engine(ASYNC_DATABASE_URL)
    else:
        # File-based SQLite needs check_same_thread False
        async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False})
elif ASYNC_DATABASE_URL.startswith("postgresql+asyncpg"):
    # PostgreSQL with asyncpg doesn't need special connect_args
    async_engine = create_async_engine(ASYNC_DATABASE_URL)
else:
    # Fallback for other drivers
    async_engine = create_async_engine(ASYNC_DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_db():
    """Dependency for async endpoints.
    This ensures proper async session management for FastAPI endpoints.
    """
    # Use AsyncSessionLocal directly - we don't need to manage the event loop here
    # because FastAPI already does that for us in the ASGI server
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_async_session():
    """Alternative dependency for when you need to use an async session in a sync context.
    This should be used sparingly and carefully.
    """
    try:
        # Make sure we have an event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            _asyncio_event_loop.set(loop)
            
        # Create a session and run it in the event loop
        session = AsyncSessionLocal()
        try:
            yield session
        finally:
            # Ensure session is closed properly
            asyncio.run_coroutine_threadsafe(session.close(), loop)            
    except Exception as e:
        print(f"Error in get_async_session: {e}")
        raise

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
