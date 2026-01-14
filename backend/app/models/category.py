from typing import Optional
from beanie import Indexed, PydanticObjectId
from pydantic import Field
from .base import TenantDocument

class ItemCategory(TenantDocument):
    name: Indexed(str) = Field(..., description="Category name")
    parent_category_id: Optional[PydanticObjectId] = Field(None, description="Parent category if any")

    class Settings:
        name = "item_categories"
