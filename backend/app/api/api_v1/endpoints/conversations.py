from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
from app.db.session import get_db
from app.models.conversation import Conversation, Message

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def read_conversations(
    skip: int = 0, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    """
    List conversations with pagination.
    """
    # Get total count
    count_query = select(func.count(Conversation.id))
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Get paginated items
    query = select(Conversation).order_by(Conversation.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    return {
        "items": [
            {
                "id": c.id,
                "whatsapp_id": c.whatsapp_id,
                "location_state": c.location_state,
                "problem_category": c.problem_category,
                "created_at": c.started_at,
                "updated_at": c.updated_at
            }
            for c in conversations
        ],
        "total": total
    }

@router.get("/{conversation_id}/messages", response_model=List[dict])
async def read_messages(
    conversation_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages for a specific conversation.
    """
    # Check if conversation exists
    result = await db.execute(select(Conversation).filter(Conversation.id == conversation_id))
    conversation = result.scalars().first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    query = (
        select(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.asc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "media_url": m.media_url,
            "created_at": m.timestamp
        }
        for m in messages
    ]
