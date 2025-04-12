from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.base import get_db
from app.schemas.notification import Notification, NotificationSeverity

router = APIRouter()

@router.get("", response_model=List[Notification])
async def get_notifications(
    severity: Optional[NotificationSeverity] = None,
    is_read: Optional[bool] = None,
    is_archived: Optional[bool] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Get notifications with optional filters
    """
    # In a real implementation, we would query the database for notifications
    # For now, return placeholder data
    import random
    
    notifications = []
    severities = [NotificationSeverity.NORMAL, NotificationSeverity.CAUTION, NotificationSeverity.RISK]
    
    for i in range(1, 10):
        notification_severity = severity or random.choice(severities)
        notification_read = is_read if is_read is not None else random.choice([True, False])
        notification_archived = is_archived if is_archived is not None else random.choice([True, False])
        
        related_types = ["fan", "chatter", "creator", None]
        related_type = random.choice(related_types)
        related_id = random.randint(1, 100) if related_type else None
        
        message = ""
        if notification_severity == NotificationSeverity.NORMAL:
            message = random.choice([
                "New fan signed up",
                "Creator posted new content",
                "Weekly report generated",
                "Chatter completed training"
            ])
        elif notification_severity == NotificationSeverity.CAUTION:
            message = random.choice([
                "Fan engagement dropping",
                "Chatter response time increasing",
                "Creator content frequency decreasing",
                "Unusual login pattern detected"
            ])
        else:  # RISK
            message = random.choice([
                "Fan at high risk of churn",
                "Creator revenue down 30%",
                "Chatter showing burnout signs",
                "Multiple payment failures detected"
            ])
        
        notifications.append({
            "id": i,
            "message": message,
            "severity": notification_severity,
            "related_id": related_id,
            "related_type": related_type,
            "is_read": notification_read,
            "is_archived": notification_archived,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        })
    
    return notifications

@router.post("/{notification_id}/read", response_model=Dict[str, Any])
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a notification as read
    """
    # In a real implementation, we would update the notification in the database
    # For now, return a placeholder response
    return {
        "status": "success",
        "message": f"Notification {notification_id} marked as read"
    }

@router.post("/{notification_id}/archive", response_model=Dict[str, Any])
async def archive_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Archive a notification
    """
    # In a real implementation, we would update the notification in the database
    # For now, return a placeholder response
    return {
        "status": "success",
        "message": f"Notification {notification_id} archived"
    }
