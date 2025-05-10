from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.tool import Tool
from ..schemas.tool import ToolCreate

# Funções Síncronas
def create_tool(db: Session, tool_in: ToolCreate) -> Tool:
    tool = Tool(**tool_in.dict())
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return tool

def get_tool(db: Session, tool_id: int) -> Tool:
    return db.query(Tool).filter(Tool.id == tool_id).first()

def get_tools(db: Session, skip: int = 0, limit: int = 100) -> list[Tool]:
    return db.query(Tool).offset(skip).limit(limit).all()

def update_tool(db: Session, tool_id: int, tool_in: ToolCreate) -> Tool:
    tool = get_tool(db, tool_id)
    for key, value in tool_in.dict().items():
        setattr(tool, key, value)
    db.commit()
    db.refresh(tool)
    return tool

def delete_tool(db: Session, tool_id: int) -> None:
    db.query(Tool).filter(Tool.id == tool_id).delete()
    db.commit()

def get_tool_by_key(db: Session, key: str) -> Tool:
    return db.query(Tool).filter(Tool.key == key).first()

# Funções Assíncronas
async def delete_tool_async(db: AsyncSession, tool_id: int) -> None:
    stmt = select(Tool).where(Tool.id == tool_id)
    result = await db.execute(stmt)
    tool = result.scalar_one()
    await db.delete(tool)
    await db.commit()

async def get_tool_by_key_async(db: AsyncSession, key: str) -> Tool:
    stmt = select(Tool).where(Tool.key == key)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

