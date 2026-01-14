from beanie import Indexed
from pydantic import Field
from .base import TenantDocument

class Tax(TenantDocument):
    name: Indexed(str) = Field(..., description="Name of the tax (e.g., GST 18%)")
    rate: float = Field(..., ge=0, le=100, description="Tax rate in percentage")
    tax_type: str = Field(..., description="CGST / SGST / IGST / VAT")

    class Settings:
        name = "taxes"
