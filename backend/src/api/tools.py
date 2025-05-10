from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from ..db import get_db
from ..crud.tool import create_tool, get_tool, get_tools, update_tool, delete_tool, get_tool_by_key
from ..schemas.tool import ToolCreate, ToolOut

router = APIRouter(prefix="/tools", tags=["tools"])


@router.post("/", response_model=ToolOut)
async def create_tool_endpoint(tool_in: ToolCreate, db: Session = Depends(get_db)):
    """Cria uma nova ferramenta."""
    return await run_in_threadpool(create_tool, db, tool_in)

@router.get("/", response_model=List[ToolOut])
async def list_tools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista ferramentas, com paginação."""
    return await run_in_threadpool(get_tools, db, skip, limit)

@router.get("/{tool_id}", response_model=ToolOut)
async def get_tool_endpoint(tool_id: int, db: Session = Depends(get_db)):
    """Retorna uma ferramenta por ID."""
    tool = await run_in_threadpool(get_tool, db, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.put("/{tool_id}", response_model=ToolOut)
async def update_tool_endpoint(tool_id: int, tool_in: ToolCreate, db: Session = Depends(get_db)):
    """Atualiza uma ferramenta existente."""
    tool = await run_in_threadpool(update_tool, db, tool_id, tool_in)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.delete("/{tool_id}", status_code=204)
async def delete_tool_endpoint(tool_id: int, db: Session = Depends(get_db)):
    """Remove uma ferramenta."""
    await run_in_threadpool(delete_tool, db, tool_id)
    return None