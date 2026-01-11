from pydantic import BaseModel
from typing import List, Optional

class WhatsAppMessage(BaseModel):
    from_: str
    id: str
    timestamp: str
    text: Optional[dict] = None
    image: Optional[dict] = None
    type: str

    class Config:
        fields = {'from_': 'from'}

class WhatsAppChange(BaseModel):
    value: dict
    field: str

class WhatsAppEntry(BaseModel):
    id: str
    changes: List[WhatsAppChange]

class WhatsAppWebhook(BaseModel):
    object: str
    entry: List[WhatsAppEntry]
