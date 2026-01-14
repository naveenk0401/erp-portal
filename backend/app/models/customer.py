from beanie import Indexed
from pydantic import Field, EmailStr
from typing import Optional
from .base import TenantDocument

class Customer(TenantDocument):
    name: Indexed(str) = Field(..., description="Customer name")
    email: Optional[EmailStr] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    billing_address: Optional[dict] = Field(None, description="Detailed billing address")
    shipping_address: Optional[dict] = Field(None, description="Detailed shipping address")
    gst_number: Optional[str] = Field(None, description="GST number")

    class Settings:
        name = "customers"
