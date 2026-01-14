from datetime import datetime
from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional

class TenantDocument(Document):
    """
    Base class for all documents that belong to a specific company (tenant).
    """
    company_id: PydanticObjectId = Field(..., description="ID of the company this document belongs to")
    is_active: bool = Field(default=True, description="Soft delete flag")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
