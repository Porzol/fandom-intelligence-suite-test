from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class NotificationSeverity(str, Enum):
    NORMAL = "normal"
    CAUTION = "caution"
    RISK = "risk"

class NotificationBase(BaseModel):
    message: str
    severity: NotificationSeverity = NotificationSeverity.NORMAL
    related_id: Optional[int] = None
    related_type: Optional[str] = None
    is_read: bool = False
    is_archived: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    message: Optional[str] = None
    severity: Optional[NotificationSeverity] = None
    related_id: Optional[int] = None
    related_type: Optional[str] = None
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None

class NotificationInDB(NotificationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Notification(NotificationInDB):
    pass
