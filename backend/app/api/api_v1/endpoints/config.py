from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models.system_config import SystemConfig as SystemConfigModel
from app.schemas.system_config import SystemConfigCreate, SystemConfig, SystemConfigUpdate

router = APIRouter()

@router.get("/", response_model=List[SystemConfig])
async def read_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemConfigModel))
    return result.scalars().all()

@router.post("/", response_model=SystemConfig)
async def create_config(config: SystemConfigCreate, db: AsyncSession = Depends(get_db)):
    # Check if key exists
    result = await db.execute(select(SystemConfigModel).filter(SystemConfigModel.key == config.key))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Key already exists")
    
    new_config = SystemConfigModel(**config.model_dump())
    db.add(new_config)
    await db.commit()
    await db.refresh(new_config)
    return new_config

@router.put("/{key}", response_model=SystemConfig)
async def update_config(key: str, config: SystemConfigUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemConfigModel).filter(SystemConfigModel.key == key))
    db_config = result.scalars().first()
    if not db_config:
        # If not exists, create it (upsert-like behavior could be useful, but let's stick to update logic or create if missing)
        # For better UX, let's create if missing
        new_config = SystemConfigModel(key=key, value=config.value)
        db.add(new_config)
        await db.commit()
        await db.refresh(new_config)
        return new_config
    
    db_config.value = config.value
    await db.commit()
    await db.refresh(db_config)
    return db_config

@router.get("/{key}", response_model=SystemConfig)
async def read_config(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemConfigModel).filter(SystemConfigModel.key == key))
    config = result.scalars().first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    return config
