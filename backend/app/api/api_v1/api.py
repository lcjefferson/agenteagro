from fastapi import APIRouter
from app.api.api_v1.endpoints import whatsapp, geo, config, analytics, professionals, conversations

api_router = APIRouter()
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(geo.router, prefix="/geo", tags=["geo"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
