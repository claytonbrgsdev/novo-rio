from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..models.planting import Planting
from ..schemas.planting import PlantingCreate, PlantingUpdate


async def create_planting_async(db: AsyncSession, planting: PlantingCreate) -> Planting:
    """
    Create a new planting asynchronously.
    Validates that there is no other planting with the same quadrant_id and slot_index.
    """
    # Check if the slot is already occupied
    result = await db.execute(
        select(Planting).where(
            Planting.quadrant_id == planting.quadrant_id,
            Planting.slot_index == planting.slot_index
        )
    )
    existing = result.scalars().first()
    
    if existing:
        raise ValueError(f"Slot {planting.slot_index} in quadrant {planting.quadrant_id} is already occupied")
    
    # Create the planting
    db_obj = Planting(**planting.dict())
    db.add(db_obj)
    try:
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Unable to create planting in slot {planting.slot_index} of quadrant {planting.quadrant_id}. The slot may be occupied.")


async def get_planting_async(db: AsyncSession, planting_id: int) -> Optional[Planting]:
    """Get a planting by ID asynchronously."""
    result = await db.execute(select(Planting).where(Planting.id == planting_id))
    return result.scalars().first()


async def get_plantings_by_player_async(db: AsyncSession, player_id: int, skip: int = 0, limit: int = 100) -> List[Planting]:
    """Get all plantings for a player asynchronously."""
    result = await db.execute(
        select(Planting)
        .where(Planting.player_id == player_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_plantings_by_quadrant_async(db: AsyncSession, quadrant_id: int, skip: int = 0, limit: int = 100) -> List[Planting]:
    """Get all plantings in a quadrant asynchronously."""
    result = await db.execute(
        select(Planting)
        .where(Planting.quadrant_id == quadrant_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def update_planting_async(db: AsyncSession, planting_id: int, planting_data: PlantingUpdate) -> Optional[Planting]:
    """Update a planting asynchronously."""
    db_obj = await get_planting_async(db, planting_id)
    if db_obj:
        for field, value in planting_data.dict(exclude_unset=True).items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
    return db_obj


async def delete_planting_async(db: AsyncSession, planting_id: int) -> None:
    """Delete a planting asynchronously."""
    db_obj = await get_planting_async(db, planting_id)
    if db_obj:
        await db.delete(db_obj)
        await db.commit()


async def is_slot_available_async(db: AsyncSession, quadrant_id: int, slot_index: int) -> bool:
    """
    Check if a slot is available in a quadrant asynchronously.
    Returns True if the slot is available, False otherwise.
    """
    result = await db.execute(
        select(Planting).where(
            Planting.quadrant_id == quadrant_id,
            Planting.slot_index == slot_index
        )
    )
    existing = result.scalars().first()
    
    return existing is None
