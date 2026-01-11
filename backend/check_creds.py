import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.system_config import SystemConfig

async def check_credentials():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(SystemConfig))
        configs = result.scalars().all()
        
        print("Checking credentials in DB:")
        found_token = False
        found_id = False
        
        for cfg in configs:
            if cfg.key == "whatsapp_access_token":
                print(f"Token found: {'Yes' if cfg.value else 'No'} (Length: {len(cfg.value) if cfg.value else 0})")
                if cfg.value and len(cfg.value) > 20: found_token = True
            elif cfg.key == "whatsapp_number_id":
                print(f"Number ID found: {'Yes' if cfg.value else 'No'} (Value: {cfg.value})")
                if cfg.value and len(cfg.value) > 5: found_id = True
                
        if not found_token or not found_id:
            print("\nWARNING: Credentials appear to be missing or invalid!")
        else:
            print("\nCredentials look correctly populated.")

if __name__ == "__main__":
    asyncio.run(check_credentials())
