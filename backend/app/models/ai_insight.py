from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base

class TargetType(enum.Enum):
    FAN = "fan"
    CHATTER = "chatter"
    CREATOR = "creator"
    MESSAGE = "message"
    GENERAL = "general"

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(Enum(TargetType), nullable=False)
    target_id = Column(Integer, nullable=True)
    summary = Column(String, nullable=False)
    details = Column(String, nullable=False)
    tags = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=False)
    action_items = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<AIInsight {self.id}: {self.target_type.name} {self.target_id}>"
