from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatterBase(BaseModel):
    name: str
    timezone: Optional[str] = None
    performance_score: float = 0.0

class ChatterCreate(ChatterBase):
    pass

class ChatterUpdate(BaseModel):
    name: Optional[str] = None
    timezone: Optional[str] = None
    performance_score: Optional[float] = None

class ChatterInDB(ChatterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Chatter(ChatterInDB):
    pass
