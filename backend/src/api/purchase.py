from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..db import SessionLocal
from ..crud.purchase import create_purchase, get_purchases, get_purchase
from ..schemas.purchase import PurchaseCreate, PurchaseOut

router = APIRouter(prefix="/purchases", tags=["purchases"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PurchaseOut,
             summary="Create Purchase",
             description="Creates a new purchase and debits player balance.\n\nExample request:\n```json\n{ \"player_id\": 1, \"item_id\": 2, \"quantity\": 3 }\n```\nExample response:\n```json\n{ \"id\": 1, \"player_id\": 1, \"item_id\": 2, \"quantity\": 3, \"total_price\": 30.0 }\n```")
async def create_purchase_endpoint(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    """Creates a purchase if player has sufficient balance, else raises HTTPException."""
    try:
        return await run_in_threadpool(create_purchase, db, purchase)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[PurchaseOut],
            summary="List Purchases",
            description="Retrieves a list of purchases with pagination.\n\nExample response:\n```json\n[{ \"id\": 1, \"player_id\": 1, \"item_id\": 2, \"quantity\": 3, \"total_price\": 30.0 }]\n```")
async def list_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Returns a list of purchases."""
    return await run_in_threadpool(get_purchases, db, skip, limit)

@router.get("/{purchase_id}", response_model=PurchaseOut,
            summary="Get Purchase",
            description="Retrieves a single purchase by its ID.\n\nExample path: `/purchases/1`\nExample response:\n```json\n{ \"id\": 1, \"player_id\": 1, \"item_id\": 2, \"quantity\": 3, \"total_price\": 30.0 }\n```")
async def get_purchase_endpoint(purchase_id: int, db: Session = Depends(get_db)):
    """Fetches a purchase by ID, raises if not found."""
    p = await run_in_threadpool(get_purchase, db, purchase_id)
    if not p:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return p
