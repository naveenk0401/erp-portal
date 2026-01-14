from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class AuditBaseSchema(BaseSchema):
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    deleted_at: Optional[datetime] = None
