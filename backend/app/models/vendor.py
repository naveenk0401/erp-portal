from beanie import Indexed
from pydantic import Field, EmailStr
from typing import Optional
from .base import TenantDocument

class Vendor(TenantDocument):
    name: Indexed(str) = Field(..., description="Vendor name")
    email: Optional[EmailStr] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    address: Optional[dict] = Field(None, description="Vendor address")
    gst_number: Optional[str] = Field(None, description="GST number")

    class Settings:
        name = "vendors"
