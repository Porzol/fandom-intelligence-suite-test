from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CreatorBase(BaseModel):
    name: str
    join_date: Optional[datetime] = None
    earnings_total: float = 0.0

class CreatorCreate(CreatorBase):
    pass

class CreatorUpdate(BaseModel):
    name: Optional[str] = None
    join_date: Optional[datetime] = None
    earnings_total: Optional[float] = None

class CreatorInDB(CreatorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Creator(CreatorInDB):
    pass
