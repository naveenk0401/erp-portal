from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed, Link
from pydantic import EmailStr, Field
from app.models.rbac import RoleEnum, Department
from app.models.company import Company

class User(Document):
    supabase_id: Optional[str] = Field(default=None, unique=True)
    email: Indexed(EmailStr, unique=True)
    full_name: str
    hashed_password: str
    company: Optional[Link[Company]] = None
    department: Optional[Department] = None
    role: Optional[RoleEnum] = RoleEnum.EMPLOYEE
    is_active: bool = True
    salary: float = 0.0
    status: str = "active" # active, on_leave, terminated
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
