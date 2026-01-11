from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, index=True, nullable=False) # Veterinário, Agrônomo, Agricultor, etc.
    state = Column(String, index=True, nullable=False) # UF
    city = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    specialties = Column(Text, nullable=True) # JSON or comma-separated string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
