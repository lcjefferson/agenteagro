from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.db.session import get_db
from app.models.professional import Professional as ProfessionalModel
from app.schemas.professional import ProfessionalCreate, Professional as ProfessionalSchema, ProfessionalUpdate

router = APIRouter()

@router.get("/", response_model=List[ProfessionalSchema])
async def read_professionals(
    skip: int = 0, 
    limit: int = 100, 
    state: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(ProfessionalModel)
    
    if state:
        query = query.filter(ProfessionalModel.state == state)
    if type:
        query = query.filter(ProfessionalModel.type == type)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ProfessionalSchema)
async def create_professional(professional: ProfessionalCreate, db: AsyncSession = Depends(get_db)):
    db_professional = ProfessionalModel(**professional.model_dump())
    db.add(db_professional)
    await db.commit()
    await db.refresh(db_professional)
    return db_professional

@router.get("/{professional_id}", response_model=ProfessionalSchema)
async def read_professional(professional_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProfessionalModel).filter(ProfessionalModel.id == professional_id))
    professional = result.scalars().first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@router.delete("/{professional_id}", response_model=ProfessionalSchema)
async def delete_professional(professional_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProfessionalModel).filter(ProfessionalModel.id == professional_id))
    professional = result.scalars().first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    
    await db.delete(professional)
    await db.commit()
    return professional
