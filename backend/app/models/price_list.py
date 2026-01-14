from typing import List
from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field
from .base import TenantDocument

class ItemPrice(BaseModel):
    item_id: PydanticObjectId
    price: float

class PriceList(TenantDocument):
    name: Indexed(str) = Field(..., description="Price list name")
    item_prices: List[ItemPrice] = Field(default_factory=list)

    class Settings:
        name = "price_lists"
