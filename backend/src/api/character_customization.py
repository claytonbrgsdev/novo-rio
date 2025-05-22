"""
API endpoints for character customization options.

This module provides endpoints to retrieve available customization options
for character creation, including heads, bodies, and tools.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from ..db import get_db, get_async_db
from ..models import Head, Body, Tool
from ..schemas.character_customization import (
    HeadOut, BodyOut, ToolOut
)

router = APIRouter(
    prefix="", # Removido o prefixo redundante pois ele já é adicionado no main.py
    tags=["character_customization"],
    responses={404: {"description": "Not found"}},
)

@router.get("/heads", response_model=List[HeadOut])
async def list_heads(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    """
    Get a list of available head options for character customization.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
        
    Returns:
        List of head options with their details
    """
    try:
        result = await db.execute(Head.__table__.select().offset(skip).limit(limit))
        heads = result.fetchall()
        if not heads:
            # Retornar lista vazia em vez de 404, pois é um comportamento válido
            return []
        return [HeadOut.from_orm(head) for head in heads]
    except Exception as e:
        print(f"Error fetching head options: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch head options: {str(e)}"
        )

@router.get("/bodies", response_model=List[BodyOut])
async def list_bodies(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    """
    Get a list of available body options for character customization.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
        
    Returns:
        List of body options with their details
    """
    try:
        result = await db.execute(Body.__table__.select().offset(skip).limit(limit))
        bodies = result.fetchall()
        if not bodies:
            # Retornar lista vazia em vez de 404, pois é um comportamento válido
            return []
        return [BodyOut.from_orm(body) for body in bodies]
    except Exception as e:
        print(f"Error fetching body options: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch body options: {str(e)}"
        )

@router.get("/tools", response_model=List[dict])
async def list_tools(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_db)):
    """
    Get a list of available tools for character customization.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
        
    Returns:
        List of tools with their details
    """
    try:
        result = await db.execute(Tool.__table__.select().offset(skip).limit(limit))
        tools = result.fetchall()
        if not tools:
            # Retornar lista vazia em vez de 404, pois é um comportamento válido
            return []
        
        # Converter manualmente para dicionários com os campos esperados
        formatted_tools = []
        for tool in tools:
            # Para resolver o problema de compatibilidade, retornamos como dict em vez de usar o schema
            formatted_tool = {
                "id": tool.id,
                "key": tool.key,
                "common_name": tool.common_name,
                "description": tool.description,
                "task_type": tool.task_type,
                "efficiency": tool.efficiency,
                "durability": tool.durability,
                "image_url": getattr(tool, 'image_url', None),
                # Garantir que estes campos sejam do tipo correto
                "compatible_with": tool.compatible_with if isinstance(tool.compatible_with, list) else [],
                "effects": tool.effects if isinstance(tool.effects, dict) else {},
                # Adicionar campos de timestamp requeridos pelo schema
                "created_at": getattr(tool, 'created_at', None) or datetime.now(),
                "updated_at": getattr(tool, 'updated_at', None)
            }
            formatted_tools.append(formatted_tool)
        
        return formatted_tools
    except Exception as e:
        print(f"Error fetching tool options: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tool options: {str(e)}"
        )
