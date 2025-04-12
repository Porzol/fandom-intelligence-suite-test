from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from app.db.base import get_db
from app.schemas.fan import Fan
from app.schemas.chatter import Chatter
from app.schemas.creator import Creator

router = APIRouter()

@router.get("/fans", response_model=List[Fan])
async def get_fans_dashboard(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    creator_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get fan dashboard data with optional filters
    """
    # Implementation will be added when we implement the repository layer
    # For now, return placeholder data
    return [
        {
            "id": 1,
            "name": "Fan 1",
            "total_spent": 150.0,
            "first_seen": datetime.now() - timedelta(days=30),
            "last_active": datetime.now() - timedelta(days=2),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "name": "Fan 2",
            "total_spent": 75.0,
            "first_seen": datetime.now() - timedelta(days=15),
            "last_active": datetime.now() - timedelta(days=1),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

@router.get("/chatters", response_model=List[Chatter])
async def get_chatters_dashboard(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get chatter dashboard data
    """
    # Implementation will be added when we implement the repository layer
    # For now, return placeholder data
    return [
        {
            "id": 1,
            "name": "Chatter 1",
            "timezone": "UTC-5",
            "performance_score": 85.5,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "name": "Chatter 2",
            "timezone": "UTC+1",
            "performance_score": 92.0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

@router.get("/creators", response_model=List[Creator])
async def get_creators_dashboard(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get creator dashboard data
    """
    # Implementation will be added when we implement the repository layer
    # For now, return placeholder data
    return [
        {
            "id": 1,
            "name": "Creator 1",
            "join_date": datetime.now() - timedelta(days=90),
            "earnings_total": 5000.0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "name": "Creator 2",
            "join_date": datetime.now() - timedelta(days=45),
            "earnings_total": 3200.0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
