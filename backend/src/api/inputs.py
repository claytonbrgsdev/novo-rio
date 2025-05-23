from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas.input import InputCreate, InputOut, InputWithEffectsOut
from ..crud.input import create_input, get_input, get_inputs, get_all_inputs, delete_input
from ..services.input_effects import apply_input_effects

router = APIRouter()


@router.post("/", response_model=InputWithEffectsOut, summary="Apply an input/resource to a planting")
def create_input_endpoint(input_in: InputCreate, db: Session = Depends(get_db)):
    """
    Apply an agricultural input/resource (water, fertilizer, compost, etc.) to a planting.
    
    - **planting_id**: ID of the planting to apply the input to
    - **type**: Type of input (água, fertilizante, composto, etc.)
    - **quantity**: Amount of the input applied
    
    Returns complete details about the input and its effects on soil parameters and plant attributes.
    """
    try:
        # Criar o registro do insumo
        input_record = create_input(db, input_in)
        
        # Buscar efeitos aplicados para detalhar na resposta
        effects_info = apply_input_effects(db, input_record)
        
        # Construir resposta enriquecida com detalhes dos efeitos
        response = InputWithEffectsOut(
            **input_record.__dict__,
            effects=[
                {
                    "parameter": effect["parameter"],
                    "before": effect["before"],
                    "after": effect["after"],
                    "change": effect["change"]
                } for effect in effects_info.get("effects", [])
            ],
            terrain_id=effects_info.get("terrain_id"),
            quadrant_id=effects_info.get("quadrant_id"),
            plant_effects=effects_info.get("plant_effects")
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[InputOut], summary="Get inputs for a planting")
def get_inputs_endpoint(
    planting_id: int = Query(None, description="Filter inputs by planting ID"),
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of inputs applied to plantings.
    
    - If **planting_id** is provided, returns inputs for that specific planting
    - Otherwise, returns all inputs
    """
    if planting_id is not None:
        return get_inputs(db, planting_id=planting_id, skip=skip, limit=limit)
    return get_all_inputs(db, skip=skip, limit=limit)


@router.get("/{input_id}", response_model=InputOut, summary="Get a specific input")
def get_input_endpoint(input_id: int, db: Session = Depends(get_db)):
    """
    Retrieve details of a specific input by its ID.
    """
    input_record = get_input(db, input_id)
    if not input_record:
        raise HTTPException(status_code=404, detail="Input not found")
    return input_record


@router.delete("/{input_id}", summary="Delete an input")
def delete_input_endpoint(input_id: int, db: Session = Depends(get_db)):
    """
    Delete an input by its ID.
    """
    success = delete_input(db, input_id)
    if not success:
        raise HTTPException(status_code=404, detail="Input not found")
    return {"message": "Input deleted successfully"}
