from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    TEXT = "text"
    PHOTO = "photo"
    VIDEO = "video"
    VOICE = "voice"
    PPV = "ppv"

class MessageBase(BaseModel):
    fan_id: int
    chatter_id: int
    creator_id: int
    sent_time: datetime
    message_type: MessageType = MessageType.TEXT
    content: Optional[str] = None
    price: float = 0.0
    purchased: bool = False

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    fan_id: Optional[int] = None
    chatter_id: Optional[int] = None
    creator_id: Optional[int] = None
    sent_time: Optional[datetime] = None
    message_type: Optional[MessageType] = None
    content: Optional[str] = None
    price: Optional[float] = None
    purchased: Optional[bool] = None

class MessageInDB(MessageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Message(MessageInDB):
    pass
