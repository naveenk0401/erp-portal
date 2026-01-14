from datetime import datetime
from typing import Optional
from beanie import Indexed, PydanticObjectId
from pydantic import Field
from .base import TenantDocument

class FileMetadata(TenantDocument):
    file_name: str
    file_type: str  # MIME type
    supabase_path: Indexed(str, unique=True)
    related_entity: Optional[str] = None  # e.g., "invoice", "payment", "profile"
    entity_id: Optional[PydanticObjectId] = None
    uploaded_by: PydanticObjectId
    size_bytes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "file_metadata"
        indexes = [
            "related_entity",
            "entity_id",
            "uploaded_by",
            "company_id" # Inherited but explicit in indexes is fine
        ]
