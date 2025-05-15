from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import os
import importlib

from src.db import get_db, Base, engine
from src.config import settings

router = APIRouter(prefix="/test", tags=["test"])

@router.post("/reset")
async def reset_database(db: AsyncSession = Depends(get_db)):
    """
    Reset the database to its initial state.
    This endpoint is for testing purposes only and should not be exposed in production.
    """
    if settings.ENVIRONMENT != "test" and settings.ENVIRONMENT != "development":
        return {"detail": "This endpoint is only available in test/development environment"}
    
    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Run migrations
    try:
        # Import alembic config dynamically to avoid circular imports
        alembic_module = importlib.import_module("alembic.config")
        alembic_command = importlib.import_module("alembic.command")
        
        # Create alembic config
        alembic_cfg = alembic_module.Config()
        alembic_cfg.set_main_option("script_location", os.path.join(os.getcwd(), "migrations"))
        alembic_cfg.set_main_option("sqlalchemy.url", str(settings.SQLALCHEMY_DATABASE_URI))
        
        # Run upgrade to latest migration
        alembic_command.upgrade(alembic_cfg, "head")
        
        return {"status": "success", "message": "Database reset successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Error running migrations: {str(e)}"}
