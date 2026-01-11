import asyncio
from app.db.session import engine
from app.db.base import Base
from app.models import User, Conversation, Message
from app.models.professional import Professional

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_models())
