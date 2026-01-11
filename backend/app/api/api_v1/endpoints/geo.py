from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.geo_service import find_nearby_professionals
from typing import List, Dict

router = APIRouter()

@router.get("/nearby", response_model=List[Dict])
async def get_nearby(lat: float, lon: float, type: str = "veterinarian", db: AsyncSession = Depends(get_db)):
    return await find_nearby_professionals(db, lat, lon, type)
