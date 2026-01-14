from pydantic import BaseModel, Field
from typing import List, Optional
from beanie import PydanticObjectId
from datetime import datetime

class ItemPrice(BaseModel):
    item_id: PydanticObjectId
    price: float

class PriceListBase(BaseModel):
    name: str
    item_prices: List[ItemPrice] = []

class PriceListCreate(PriceListBase):
    pass

class PriceListUpdate(BaseModel):
    name: Optional[str] = None
    item_prices: Optional[List[ItemPrice]] = None

class PriceListOut(PriceListBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
