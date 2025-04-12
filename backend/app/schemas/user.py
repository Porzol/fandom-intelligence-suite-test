from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OPS_ANALYST = "ops_analyst"
    TRAINER = "trainer"

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.TRAINER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    username: Optional[str] = None
