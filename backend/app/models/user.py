from datetime import datetime
from typing import Optional, List
from enum import Enum
from beanie import Document, Indexed, PydanticObjectId
from pydantic import EmailStr, Field

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class User(Document):
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    company_ids: List[PydanticObjectId] = []
    active_company_id: Optional[PydanticObjectId] = None
    role_ids: List[PydanticObjectId] = []
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
