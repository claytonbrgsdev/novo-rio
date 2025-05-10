import os
# from sqlalchemy import create_engine 
# from sqlalchemy.ext.declarative import declarative_base 
# from sqlalchemy.orm import sessionmaker 

# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession 
# from sqlalchemy.orm import sessionmaker as async_sessionmaker 

# SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db") 

# engine = create_engine( 
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
# )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

# Base = declarative_base() 

# Async engine and session factory
# ASYNC_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db").replace("sqlite://", "sqlite+aiosqlite://") 
# async_engine = create_async_engine(ASYNC_DATABASE_URL, connect_args={"check_same_thread": False}) 
# AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False) 

# async def get_async_db(): 
#     """Dependency for async endpoints."""
#     async with AsyncSessionLocal() as session:
#         yield session