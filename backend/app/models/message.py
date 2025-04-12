from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
import enum

from app.db.base import Base

class MessageType(enum.Enum):
    TEXT = "text"
    PHOTO = "photo"
    VIDEO = "video"
    VOICE = "voice"
    PPV = "ppv"

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    fan_id = Column(Integer, ForeignKey("fans.id"), index=True)
    chatter_id = Column(Integer, ForeignKey("chatters.id"), index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), index=True)
    sent_time = Column(DateTime(timezone=True), index=True)
    message_type = Column(Enum(MessageType), default=MessageType.TEXT)
    content = Column(String)
    price = Column(Float, default=0.0)
    purchased = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
