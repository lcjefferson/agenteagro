import asyncio
import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import AsyncSessionLocal
from app.models.professional import Professional

async def seed_professionals():
    async with AsyncSessionLocal() as db:
        print("Seeding professionals data...")
        
        professionals = [
            Professional(name="Dr. João Silva", type="Veterinário", state="SP", city="Ribeirão Preto", phone="(16) 99999-1111", specialties="Gado de corte, Equinos"),
            Professional(name="Dra. Maria Oliveira", type="Veterinário", state="SP", city="Campinas", phone="(19) 98888-2222", specialties="Pequenos animais, Clínica geral"),
            Professional(name="Eng. Pedro Santos", type="Agrônomo", state="MT", city="Sinop", phone="(66) 97777-3333", specialties="Soja, Milho, Pragas"),
            Professional(name="Tec. Carlos Souza", type="Técnico Agrícola", state="MG", city="Uberaba", phone="(34) 96666-4444", specialties="Cafeicultura"),
            Professional(name="AgroShop Insumos", type="Fornecedor", state="GO", city="Rio Verde", phone="(64) 3621-5555", specialties="Defensivos, Fertilizantes"),
            Professional(name="Dr. Roberto Costa", type="Veterinário", state="MG", city="Belo Horizonte", phone="(31) 95555-6666", specialties="Gado de leite"),
        ]
        
        for p in professionals:
            db.add(p)
            
        await db.commit()
        print("Seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_professionals())
