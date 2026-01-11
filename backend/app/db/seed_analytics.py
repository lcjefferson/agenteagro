import asyncio
import random
import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import AsyncSessionLocal
from app.models.conversation import Conversation

STATES = ['SP', 'MG', 'GO', 'MT', 'PR', 'RS', 'BA', 'MS']
PROBLEMS = ['Praga', 'Doença', 'Clima', 'Nutrição', 'Plantio', 'Colheita']

async def seed_analytics():
    async with AsyncSessionLocal() as db:
        print("Seeding analytics data...")
        for i in range(50):
            state = random.choice(STATES)
            problem = random.choice(PROBLEMS)
            
            conversation = Conversation(
                whatsapp_id=f"55119{random.randint(10000000, 99999999)}",
                location_state=state,
                problem_category=problem
            )
            db.add(conversation)
        
        await db.commit()
        print("Seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_analytics())
