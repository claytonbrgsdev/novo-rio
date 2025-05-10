from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.quadrant import Quadrant
from ..schemas.quadrant import QuadrantCreate, QuadrantUpdate

async def create_quadrant_async(db: AsyncSession, quadrant_in: QuadrantCreate) -> Quadrant:
    """Create a new quadrant asynchronously."""
    db_obj = Quadrant(**quadrant_in.dict())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_quadrant_async(db: AsyncSession, quadrant_id: int) -> Optional[Quadrant]:
    """Get a quadrant by ID asynchronously."""
    result = await db.execute(select(Quadrant).where(Quadrant.id == quadrant_id))
    return result.scalars().first()

async def get_quadrants_async(db: AsyncSession, terrain_id: int, skip: int = 0, limit: int = 100) -> List[Quadrant]:
    """Get all quadrants for a terrain asynchronously."""
    result = await db.execute(
        select(Quadrant)
        .where(Quadrant.terrain_id == terrain_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_quadrant_async(db: AsyncSession, quadrant_id: int, quadrant_in: QuadrantUpdate) -> Optional[Quadrant]:
    """Update a quadrant asynchronously."""
    quadrant = await get_quadrant_async(db, quadrant_id)
    if quadrant:
        for field, value in quadrant_in.dict(exclude_unset=True).items():
            setattr(quadrant, field, value)
        await db.commit()
        await db.refresh(quadrant)
    return quadrant

async def delete_quadrant_async(db: AsyncSession, quadrant_id: int) -> None:
    """Delete a quadrant asynchronously."""
    quadrant = await get_quadrant_async(db, quadrant_id)
    if quadrant:
        await db.delete(quadrant)
        await db.commit()

async def generate_quadrants_for_terrain_async(db: AsyncSession, terrain_id: int) -> List[Quadrant]:
    """Generate the 15 quadrants (5x3 grid) for a terrain asynchronously."""
    ROWS = ["A", "B", "C"]
    COLS = ["1", "2", "3", "4", "5"]
    quadrants = []
    
    for r in ROWS:
        for c in COLS:
            label = f"{r}{c}"
            quadrant = QuadrantCreate(terrain_id=terrain_id, label=label)
            db_obj = await create_quadrant_async(db, quadrant)
            quadrants.append(db_obj)
    
    return quadrants
