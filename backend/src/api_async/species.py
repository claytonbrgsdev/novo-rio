from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_async_db
from ..models.species import Species
from ..schemas.species import SpeciesSchema, SpeciesCreate, SpeciesUpdate

router = APIRouter(prefix="/async/species", tags=["species"])

@router.post("/", response_model=SpeciesSchema, status_code=status.HTTP_201_CREATED)
async def create_species(
    species: SpeciesCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new species asynchronously."""
    db_species = Species(**species.dict())
    db.add(db_species)
    await db.commit()
    await db.refresh(db_species)
    return db_species

@router.get("/", response_model=List[SpeciesSchema])
async def list_species(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_async_db)
):
    """List all species asynchronously with pagination."""
    result = await db.execute(select(Species).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{species_id}", response_model=SpeciesSchema)
async def get_species(
    species_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """Get a species by ID asynchronously."""
    result = await db.execute(select(Species).where(Species.id == species_id))
    species = result.scalars().first()
    if not species:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species with ID {species_id} not found"
        )
    return species

@router.put("/{species_id}", response_model=SpeciesSchema)
async def update_species(
    species_id: int,
    species_update: SpeciesUpdate,
    db: AsyncSession = Depends(get_async_db)
):
    """Update a species asynchronously."""
    result = await db.execute(select(Species).where(Species.id == species_id))
    db_species = result.scalars().first()
    if not db_species:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species with ID {species_id} not found"
        )
    
    update_data = species_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_species, key, value)
    
    await db.commit()
    await db.refresh(db_species)
    return db_species

@router.delete("/{species_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_species(
    species_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """Delete a species asynchronously."""
    result = await db.execute(select(Species).where(Species.id == species_id))
    db_species = result.scalars().first()
    if not db_species:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species with ID {species_id} not found"
        )
    
    await db.delete(db_species)
    await db.commit()
    return None
