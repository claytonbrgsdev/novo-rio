from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.tool import Tool

class ToolCreate(BaseModel):
    common_name: str
    key: str
    description: str
    task_type: str
    efficiency: float
    durability: int
    compatible_with: list[str]
    effects: dict

class ToolOut(BaseModel):
    id: int
    common_name: str
    key: str
    description: str
    task_type: str
    efficiency: float
    durability: int
    compatible_with: list[str]
    effects: dict

    class Config:
        orm_mode = True

async def delete_tool_async(db: AsyncSession, tool_id: int) -> None:
    tool = await db.get(Tool, tool_id)
    if tool:
        await db.delete(tool)
        await db.commit()

async def get_tool_by_key_async(db: AsyncSession, key: str) -> Optional[Tool]:
    """
    Retorna uma ferramenta pelo seu 'key' de forma assíncrona, ou None se não encontrada.
    """
    result = await db.execute(select(Tool).where(Tool.key == key))
    return result.scalars().first()