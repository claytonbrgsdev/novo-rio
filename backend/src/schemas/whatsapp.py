from pydantic import BaseModel
from typing import Optional

class WhatsappMessageIn(BaseModel):
    phone_number: Optional[str] = None
    message: Optional[str] = None
    command: Optional[str] = None
    terrain_id: Optional[int] = None
    tool_key: Optional[str] = None

class WhatsappMessageOut(BaseModel):
    reply: str
