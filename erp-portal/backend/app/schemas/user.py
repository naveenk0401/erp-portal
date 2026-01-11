from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.rbac import Scope
from app.schemas.base import BaseSchema, AuditBaseSchema

class UserBase(BaseSchema):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    status: Optional[str] = "active"

class UserCreate(UserBase):
    email: EmailStr
    supabase_id: str
    full_name: str
    company_id: Optional[str] = None
    department_id: Optional[str] = None
    role_id: Optional[str] = None

class UserUpdate(UserBase):
    department_id: Optional[str] = None
    role_id: Optional[str] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    supabase_id: str
    email: EmailStr
    full_name: str
    salary: float = 0.0
    status: str = "active"
    is_active: bool = True
    role: Optional[str] = None
    department: Optional[str] = None
    company_id: Optional[str] = None
