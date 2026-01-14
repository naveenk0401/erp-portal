from pydantic import BaseModel
from typing import List
from beanie import PydanticObjectId
from datetime import datetime

from typing import List, Optional

class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CompanyOut(CompanyBase):
    id: PydanticObjectId
    owner_id: PydanticObjectId
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
