from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
import enum

from app.db.base import Base

class NotificationSeverity(enum.Enum):
    NORMAL = "normal"
    CAUTION = "caution"
    RISK = "risk"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    severity = Column(Enum(NotificationSeverity), default=NotificationSeverity.NORMAL)
    related_id = Column(Integer)
    related_type = Column(String)
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
