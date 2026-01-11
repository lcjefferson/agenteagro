import asyncio
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from app.db.base import Base
# Import all models to ensure they are registered
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.professional import Professional
from app.models.system_config import SystemConfig

async def create_tables():
    async with engine.begin() as conn:
        print("Creating missing tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created!")

if __name__ == "__main__":
    asyncio.run(create_tables())
