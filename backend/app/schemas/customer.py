from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict
from beanie import PydanticObjectId
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    billing_address: Optional[Dict] = None
    shipping_address: Optional[Dict] = None
    gst_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    billing_address: Optional[Dict] = None
    shipping_address: Optional[Dict] = None
    gst_number: Optional[str] = None

class CustomerOut(CustomerBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
