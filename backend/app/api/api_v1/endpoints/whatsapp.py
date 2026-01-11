from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.whatsapp_service import process_whatsapp_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/webhook")
async def verify_webhook(request: Request):
    """
    Verification endpoint for WhatsApp Webhook.
    """
    params = request.query_params
    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == "agenteagro_token":
        return int(params.get("hub.challenge"))
    raise HTTPException(status_code=403, detail="Invalid verification token")

@router.post("/webhook")
async def receive_message(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive messages from WhatsApp.
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
                        await process_whatsapp_message(db, msg)
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
