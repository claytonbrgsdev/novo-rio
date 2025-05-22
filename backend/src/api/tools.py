from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..crud.tool import create_tool, get_tool, get_tools, update_tool, delete_tool, get_tool_by_key
from ..schemas.tool import ToolCreate, ToolOut

router = APIRouter(prefix="/tools", tags=["tools"])


@router.post("/", response_model=ToolOut)
async def create_tool_endpoint(tool_in: ToolCreate, db: Session = Depends(get_db)):
    """Cria uma nova ferramenta."""
    try:
        return create_tool(db, tool_in)
    except Exception as e:
        print(f"Error creating tool: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create tool: {str(e)}")

@router.get("/", response_model=List[ToolOut])
async def list_tools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista ferramentas, com paginação."""
    try:
        return get_tools(db, skip, limit)
    except Exception as e:
        print(f"Error listing tools: {str(e)}")
        return []

@router.get("/{tool_id}", response_model=ToolOut)
async def get_tool_endpoint(tool_id: int, db: Session = Depends(get_db)):
    """Retorna uma ferramenta por ID."""
    try:
        tool = get_tool(db, tool_id)
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        return tool
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching tool: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tool: {str(e)}")

@router.put("/{tool_id}", response_model=ToolOut)
async def update_tool_endpoint(tool_id: int, tool_in: ToolCreate, db: Session = Depends(get_db)):
    """Atualiza uma ferramenta existente."""
    try:
        tool = update_tool(db, tool_id, tool_in)
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        return tool
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating tool: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update tool: {str(e)}")

@router.delete("/{tool_id}", status_code=204)
async def delete_tool_endpoint(tool_id: int, db: Session = Depends(get_db)):
    """Remove uma ferramenta."""
    try:
        success = delete_tool(db, tool_id)
        if not success:
            raise HTTPException(status_code=404, detail="Tool not found")
        return None
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error deleting tool: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete tool: {str(e)}")