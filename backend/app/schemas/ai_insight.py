from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TargetType(str, Enum):
    FAN = "fan"
    CHATTER = "chatter"
    CREATOR = "creator"
    MESSAGE = "message"
    GENERAL = "general"

class AIInsightBase(BaseModel):
    target_type: TargetType
    target_id: Optional[int] = None
    summary: str
    details: str
    tags: Optional[List[str]] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    action_items: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class AIInsightCreate(AIInsightBase):
    pass

class AIInsightUpdate(BaseModel):
    summary: Optional[str] = None
    details: Optional[str] = None
    tags: Optional[List[str]] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    action_items: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_archived: Optional[bool] = None

class AIInsightResponse(AIInsightBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_archived: bool = False
    
    class Config:
        orm_mode = True

class AIInsightGenerateRequest(BaseModel):
    target_type: TargetType
    target_id: Optional[int] = None
    custom_prompt: Optional[str] = None

class AIInsightGenerateResponse(BaseModel):
    status: str
    message: str
    insight_id: Optional[int] = None
