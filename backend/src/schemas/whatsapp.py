from pydantic import BaseModel


class WhatsappMessageIn(BaseModel):
    phone_number: str
    message: str


class WhatsappMessageOut(BaseModel):
    reply: str
