from typing import List, Optional
from beanie import Indexed, PydanticObjectId
from pydantic import Field
from .base import TenantDocument

class Item(TenantDocument):
    name: Indexed(str) = Field(..., description="Item name")
    item_type: str = Field(..., description="PRODUCT / SERVICE")
    category_id: Optional[PydanticObjectId] = Field(None, description="Category reference")
    sku: Optional[str] = Field(None, description="Stock Keeping Unit")
    unit: str = Field(..., description="Unit of measurement (e.g., PCS, KG, HRS)")
    sale_price: float = Field(0.0)
    purchase_price: float = Field(0.0)
    tax_ids: List[PydanticObjectId] = Field(default_factory=list, description="Associated taxes")
    track_inventory: bool = Field(default=False)

    class Settings:
        name = "items"
