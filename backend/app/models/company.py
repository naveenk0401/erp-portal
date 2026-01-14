from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Company(Document):
    name: Indexed(str)
    owner_id: PydanticObjectId
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "companies"
