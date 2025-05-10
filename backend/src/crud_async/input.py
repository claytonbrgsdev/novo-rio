from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from ..models.input import Input
from ..models.planting import Planting
from ..schemas.input import InputCreate, InputUpdate
from ..services.input_effects import apply_input_effects_async


async def create_input(db: AsyncSession, input_in: InputCreate) -> Input:
    """
    Create a new input/resource applied to a planting.
    Validates that the planting exists before creating the input.
    """
    # Validate that the planting exists
    result = await db.execute(select(Planting).where(Planting.id == input_in.planting_id))
    planting = result.scalars().first()
    
    if not planting:
        raise ValueError(f"Planting with id {input_in.planting_id} not found")
    
    # Create the input
    db_input = Input(
        planting_id=input_in.planting_id,
        type=input_in.type,
        quantity=input_in.quantity
    )
    
    db.add(db_input)
    await db.commit()
    await db.refresh(db_input)
    
    # Aplicar efeitos do insumo no solo e planta
    applied_effects = await apply_input_effects_async(db, db_input)
    
    return db_input


async def get_input(db: AsyncSession, input_id: int) -> Optional[Input]:
    """Get a single input by its ID."""
    result = await db.execute(select(Input).where(Input.id == input_id))
    return result.scalars().first()


async def get_inputs(db: AsyncSession, planting_id: int, skip: int = 0, limit: int = 100) -> List[Input]:
    """Get all inputs for a specific planting."""
    result = await db.execute(
        select(Input)
        .where(Input.planting_id == planting_id)
        .order_by(Input.applied_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_all_inputs(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Input]:
    """Get all inputs across all plantings."""
    result = await db.execute(
        select(Input)
        .order_by(Input.applied_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def delete_input(db: AsyncSession, input_id: int) -> bool:
    """Delete an input by its ID."""
    result = await db.execute(select(Input).where(Input.id == input_id))
    db_input = result.scalars().first()
    
    if not db_input:
        return False
    
    await db.delete(db_input)
    await db.commit()
    
    return True
