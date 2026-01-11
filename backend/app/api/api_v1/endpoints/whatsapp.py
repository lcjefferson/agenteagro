from fastapi import APIRouter, Depends, Request, HTTPException, Response, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db, AsyncSessionLocal
from app.services.whatsapp_service import process_whatsapp_message
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    Verification endpoint for WhatsApp Webhook.
    """
    params = request.query_params
    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == settings.WHATSAPP_VERIFY_TOKEN:
        return Response(content=params.get("hub.challenge"), media_type="text/plain")
    raise HTTPException(status_code=403, detail="Invalid verification token")

async def process_message_background(message_data: dict):
    """
    Process message in background with its own DB session.
    """
    try:
        async with AsyncSessionLocal() as db:
            await process_whatsapp_message(db, message_data)
    except Exception as e:
        logger.error(f"Error in background processing: {e}")

@router.post("/webhook")
async def receive_message(request: Request, background_tasks: BackgroundTasks):
    """
    Receive messages from WhatsApp and process in background.
    """
    try:
        data = await request.json()
        logger.info(f"Received webhook data: {data}")

        # Basic parsing for Official API structure
        entry = data.get("entry", [])
        if entry:
            changes = entry[0].get("changes", [])
            if changes:
                value = changes[0].get("value", {})
                messages = value.get("messages", [])
                if messages:
                    for msg in messages:
                        # Add to background tasks to avoid timeout
                        background_tasks.add_task(process_message_background, msg)
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
