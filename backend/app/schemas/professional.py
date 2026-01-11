from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfessionalBase(BaseModel):
    name: str
    type: str
    state: str
    city: str
    phone: Optional[str] = None
    email: Optional[str] = None
    specialties: Optional[str] = None

class ProfessionalCreate(ProfessionalBase):
    pass

class ProfessionalUpdate(ProfessionalBase):
    pass

class Professional(ProfessionalBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
