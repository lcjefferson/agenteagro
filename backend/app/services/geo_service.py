from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.professional import Professional
from typing import List, Dict

async def find_nearby_professionals(db: AsyncSession, lat: float, lon: float, profession: str = "veterinarian") -> List[Dict]:
    """
    Find nearby professionals from DB.
    Currently returns all professionals matching the type as we don't have lat/lon in DB.
    """
    query = select(Professional)
    
    # Simple filtering based on profession/type
    if profession:
         prof_lower = profession.lower()
         if "vet" in prof_lower:
             query = query.filter(Professional.type == "Veterinário")
         elif "agro" in prof_lower:
             query = query.filter(Professional.type == "Agrônomo")
         elif "tec" in prof_lower or "téc" in prof_lower:
             query = query.filter(Professional.type == "Técnico Agrícola")
    
    result = await db.execute(query)
    professionals = result.scalars().all()
    
    return [
        {
            "name": p.name,
            "address": f"{p.city} - {p.state}",
            "distance": "N/A", # We don't have lat/lon in DB yet
            "contact": p.phone or p.email or "N/A",
            "specialties": p.specialties
        }
        for p in professionals
    ]
