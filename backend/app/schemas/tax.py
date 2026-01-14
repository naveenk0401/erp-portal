from pydantic import BaseModel, Field
from typing import Optional
from beanie import PydanticObjectId
from datetime import datetime

class TaxBase(BaseModel):
    name: str
    rate: float
    tax_type: str

class TaxCreate(TaxBase):
    pass

class TaxUpdate(BaseModel):
    name: Optional[str] = None
    rate: Optional[float] = None
    tax_type: Optional[str] = None

class TaxOut(TaxBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
