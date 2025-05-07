from datetime import datetime
from pydantic import BaseModel

class PlantingSchema(BaseModel):
    id: int
    species_id: int
    player_id: int
    planted_at: datetime
    current_state: str
    days_since_planting: int
    days_sem_rega: int

    class Config:
        orm_mode = True
