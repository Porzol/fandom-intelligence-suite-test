from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.auth import get_current_user, check_analyst_access
from app.db.base import get_db
from app.models.user import User
from app.models.ai_insight import AIInsight, TargetType
from app.schemas.ai_insight import (
    AIInsightResponse, 
    AIInsightCreate, 
    AIInsightUpdate,
    AIInsightGenerateRequest,
    AIInsightGenerateResponse
)
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.get("/", response_model=List[AIInsightResponse])
async def get_insights(
    skip: int = 0, 
    limit: int = 100,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    is_archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all insights with optional filtering.
    """
    query = db.query(AIInsight).filter(AIInsight.is_archived == is_archived)
    
    if target_type:
        try:
            enum_target_type = TargetType[target_type.upper()]
            query = query.filter(AIInsight.target_type == enum_target_type)
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target_type: {target_type}"
            )
    
    if target_id is not None:
        query = query.filter(AIInsight.target_id == target_id)
    
    insights = query.order_by(AIInsight.created_at.desc()).offset(skip).limit(limit).all()
    return insights

@router.get("/{insight_id}", response_model=AIInsightResponse)
async def get_insight(
    insight_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific insight by ID.
    """
    insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    return insight

@router.post("/", response_model=AIInsightResponse)
async def create_insight(
    insight: AIInsightCreate,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Create a new insight manually.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    try:
        enum_target_type = TargetType[insight.target_type.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target_type: {insight.target_type}"
        )
    
    db_insight = AIInsight(
        target_type=enum_target_type,
        target_id=insight.target_id,
        summary=insight.summary,
        details=insight.details,
        tags=insight.tags,
        confidence_score=insight.confidence_score,
        action_items=insight.action_items,
        metadata=insight.metadata
    )
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight

@router.put("/{insight_id}", response_model=AIInsightResponse)
async def update_insight(
    insight_id: int,
    insight_update: AIInsightUpdate,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Update an insight.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    db_insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
    if db_insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    update_data = insight_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_insight, key, value)
    
    db.commit()
    db.refresh(db_insight)
    return db_insight

@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insight(
    insight_id: int,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Delete an insight.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    db_insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
    if db_insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    db.delete(db_insight)
    db.commit()
    return None

@router.post("/archive/{insight_id}", response_model=AIInsightResponse)
async def archive_insight(
    insight_id: int,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Archive an insight.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    db_insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
    if db_insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    db_insight.is_archived = True
    db.commit()
    db.refresh(db_insight)
    return db_insight

@router.post("/unarchive/{insight_id}", response_model=AIInsightResponse)
async def unarchive_insight(
    insight_id: int,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Unarchive an insight.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    db_insight = db.query(AIInsight).filter(AIInsight.id == insight_id).first()
    if db_insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    
    db_insight.is_archived = False
    db.commit()
    db.refresh(db_insight)
    return db_insight

async def _generate_insight_task(
    target_type: str,
    target_id: Optional[int],
    custom_prompt: Optional[str],
    db: Session
):
    """Background task to generate an insight"""
    
    # Get target data based on target type and ID
    target_data = {}
    
    if target_type.upper() == "FAN" and target_id:
        # Query fan data
        from app.models.fan import Fan
        fan = db.query(Fan).filter(Fan.id == target_id).first()
        if fan:
            target_data = {
                "name": fan.name,
                "total_spent": fan.total_spent,
                "first_seen": str(fan.first_seen),
                "last_active": str(fan.last_active),
                "analyzed_at": datetime.now().isoformat()
            }
    
    elif target_type.upper() == "CHATTER" and target_id:
        # Query chatter data
        from app.models.chatter import Chatter
        chatter = db.query(Chatter).filter(Chatter.id == target_id).first()
        if chatter:
            target_data = {
                "name": chatter.name,
                "performance_score": chatter.performance_score,
                "timezone": chatter.timezone,
                "analyzed_at": datetime.now().isoformat()
            }
    
    elif target_type.upper() == "CREATOR" and target_id:
        # Query creator data
        from app.models.creator import Creator
        creator = db.query(Creator).filter(Creator.id == target_id).first()
        if creator:
            target_data = {
                "name": creator.name,
                "earnings_total": creator.earnings_total,
                "join_date": str(creator.join_date) if creator.join_date else "Unknown",
                "analyzed_at": datetime.now().isoformat()
            }
    
    elif target_type.upper() == "MESSAGE" and target_id:
        # Query message data
        from app.models.message import Message
        message = db.query(Message).filter(Message.id == target_id).first()
        if message:
            target_data = {
                "fan_message": message.content,
                "chatter_response": "Response not available",  # Would need to query the response
                "analyzed_at": datetime.now().isoformat()
            }
    
    else:  # GENERAL or fallback
        # Get general stats
        from app.models.fan import Fan
        from app.models.chatter import Chatter
        from app.models.creator import Creator
        
        total_fans = db.query(Fan).count()
        active_fans = db.query(Fan).filter(
            Fan.last_active >= datetime.now().date()
        ).count()
        total_chatters = db.query(Chatter).count()
        total_creators = db.query(Creator).count()
        
        target_data = {
            "total_fans": total_fans,
            "active_fans": active_fans,
            "total_chatters": total_chatters,
            "total_creators": total_creators,
            "analyzed_at": datetime.now().isoformat()
        }
    
    # Generate insight using AI service
    insight_data = await ai_service.generate_insight(target_type, target_data, custom_prompt)
    
    # Create new insight in database
    try:
        enum_target_type = TargetType[target_type.upper()]
    except KeyError:
        enum_target_type = TargetType.GENERAL
    
    db_insight = AIInsight(
        target_type=enum_target_type,
        target_id=target_id,
        summary=insight_data["summary"],
        details=insight_data["details"],
        tags=insight_data["tags"],
        confidence_score=insight_data["confidence_score"],
        action_items=insight_data["action_items"],
        metadata=insight_data["metadata"]
    )
    db.add(db_insight)
    db.commit()

@router.post("/generate", response_model=AIInsightGenerateResponse)
async def generate_insight(
    request: AIInsightGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(check_analyst_access),
    db: Session = Depends(get_db)
):
    """
    Generate a new insight using AI.
    Only accessible by admin, manager, and ops_analyst roles.
    """
    try:
        # Validate target type
        target_type = request.target_type.upper()
        TargetType[target_type]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target_type: {request.target_type}"
        )
    
    # Add task to background
    background_tasks.add_task(
        _generate_insight_task,
        target_type=request.target_type,
        target_id=request.target_id,
        custom_prompt=request.custom_prompt,
        db=db
    )
    
    return {
        "status": "processing",
        "message": f"Generating insight for {request.target_type} {request.target_id if request.target_id else 'general'}",
        "insight_id": None
    }
