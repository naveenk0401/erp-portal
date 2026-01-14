from pydantic import BaseModel, Field
from typing import Optional, List
from beanie import PydanticObjectId
from datetime import datetime

class ItemCategoryBase(BaseModel):
    name: str
    parent_category_id: Optional[PydanticObjectId] = None

class ItemCategoryCreate(ItemCategoryBase):
    pass

class ItemCategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_category_id: Optional[PydanticObjectId] = None

class ItemCategoryOut(ItemCategoryBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
