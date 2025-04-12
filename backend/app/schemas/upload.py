from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UploadBase(BaseModel):
    file_name: str
    file_hash: str
    uploaded_at: datetime
    processed: bool = False
    processed_at: Optional[datetime] = None

class UploadCreate(UploadBase):
    pass

class UploadUpdate(BaseModel):
    file_name: Optional[str] = None
    file_hash: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    processed: Optional[bool] = None
    processed_at: Optional[datetime] = None

class UploadInDB(UploadBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Upload(UploadInDB):
    pass
