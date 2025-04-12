from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FanBase(BaseModel):
    name: str
    total_spent: float = 0.0
    first_seen: Optional[datetime] = None
    last_active: Optional[datetime] = None

class FanCreate(FanBase):
    pass

class FanUpdate(BaseModel):
    name: Optional[str] = None
    total_spent: Optional[float] = None
    first_seen: Optional[datetime] = None
    last_active: Optional[datetime] = None

class FanInDB(FanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Fan(FanInDB):
    pass
