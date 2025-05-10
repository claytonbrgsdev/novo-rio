from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..models.tool import Tool
from ..schemas.tool import ToolCreate

async def create_tool_async(db: AsyncSession, tool_in: ToolCreate) -> Tool:
    """Cria uma nova ferramenta de forma assíncrona."""
    db_tool = Tool(**tool_in.dict())
    db.add(db_tool)
    await db.commit()
    await db.refresh(db_tool)
    return db_tool

async def get_tool_async(db: AsyncSession, tool_id: int) -> Optional[Tool]:
    """Obtém uma ferramenta por ID de forma assíncrona."""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    return result.scalars().first()

async def get_tools_async(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Tool]:
    """Lista ferramentas, com paginação, de forma assíncrona."""
    result = await db.execute(select(Tool).offset(skip).limit(limit))
    return result.scalars().all()

async def update_tool_async(db: AsyncSession, tool_id: int, tool_in: ToolCreate) -> Optional[Tool]:
    """Atualiza uma ferramenta de forma assíncrona."""
    tool = await get_tool_async(db, tool_id)
    if tool:
        for field, value in tool_in.dict(exclude_unset=True).items():
            setattr(tool, field, value)
        await db.commit()
        await db.refresh(tool)
    return tool

async def delete_tool_async(db: AsyncSession, tool_id: int) -> None:
    """Remove uma ferramenta de forma assíncrona."""
    tool = await get_tool_async(db, tool_id)
    if tool:
        await db.delete(tool)
        await db.commit()