from pydantic import BaseModel, Field
from typing import Optional, List
from beanie import PydanticObjectId
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    item_type: str # PRODUCT or SERVICE
    category_id: Optional[PydanticObjectId] = None
    sku: Optional[str] = None
    unit: str
    sale_price: float = 0.0
    purchase_price: float = 0.0
    tax_ids: List[PydanticObjectId] = []
    track_inventory: bool = False

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    item_type: Optional[str] = None
    category_id: Optional[PydanticObjectId] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None
    tax_ids: Optional[List[PydanticObjectId]] = None
    track_inventory: Optional[bool] = None

class ItemOut(ItemBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
