from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Any, Optional
from app.db.session import get_db
from app.models.conversation import Conversation

router = APIRouter()

@router.get("/states")
async def get_state_ranking(db: AsyncSession = Depends(get_db)):
    """
    Returns ranking of states by number of conversations.
    """
    query = (
        select(Conversation.location_state, func.count(Conversation.id).label("count"))
        .where(Conversation.location_state.isnot(None))
        .group_by(Conversation.location_state)
        .order_by(desc("count"))
    )
    result = await db.execute(query)
    return [{"state": row[0], "count": row[1]} for row in result.all()]

@router.get("/problems")
async def get_problem_ranking(state: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    Returns ranking of problems, optionally filtered by state.
    """
    query = (
        select(Conversation.problem_category, func.count(Conversation.id).label("count"))
        .where(Conversation.problem_category.isnot(None))
    )
    
    if state:
        query = query.where(Conversation.location_state == state)
        
    query = query.group_by(Conversation.problem_category).order_by(desc("count"))
    
    result = await db.execute(query)
    return [{"problem": row[0], "count": row[1]} for row in result.all()]

@router.get("/problems-by-region")
async def get_problems_by_region(db: AsyncSession = Depends(get_db)):
    """
    Returns ranking of problems grouped by state.
    """
    query = (
        select(Conversation.location_state, Conversation.problem_category, func.count(Conversation.id).label("count"))
        .where(Conversation.location_state.isnot(None))
        .where(Conversation.problem_category.isnot(None))
        .group_by(Conversation.location_state, Conversation.problem_category)
        .order_by(Conversation.location_state, desc("count"))
    )
    result = await db.execute(query)
    
    # Process result to group by state
    data = {}
    for row in result.all():
        state = row[0]
        problem = row[1]
        count = row[2]
        
        if state not in data:
            data[state] = []
        data[state].append({"problem": problem, "count": count})
        
    return [{"state": k, "problems": v} for k, v in data.items()]
