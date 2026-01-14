from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

# --- Common ---
class SalesItemBase(BaseModel):
    item_id: PydanticObjectId
    qty: float
    price: float
    tax_ids: List[PydanticObjectId] = []

class SalesItemRead(SalesItemBase):
    name: str
    unit: str
    tax_amount: float
    line_total: float

# --- Quotation ---
class QuotationBase(BaseModel):
    customer_id: PydanticObjectId
    items: List[SalesItemBase]
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None

class QuotationCreate(QuotationBase):
    pass

class QuotationRead(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    quote_number: str
    customer_id: PydanticObjectId
    customer_name: str
    items: List[SalesItemRead]
    subtotal: float
    tax_total: float
    grand_total: float
    status: str
    valid_until: Optional[datetime]
    created_at: datetime
    
    model_config = {"from_attributes": True, "populate_by_name": True}

# --- Sales Order ---
class SalesOrderCreate(BaseModel):
    customer_id: PydanticObjectId
    items: List[SalesItemBase]
    quotation_id: Optional[PydanticObjectId] = None
    notes: Optional[str] = None

class SalesOrderRead(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    order_number: str
    customer_id: PydanticObjectId
    customer_name: str
    items: List[SalesItemRead]
    subtotal: float
    tax_total: float
    grand_total: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

# --- Invoice ---
class InvoiceCreate(BaseModel):
    customer_id: PydanticObjectId
    items: List[SalesItemBase]
    sales_order_id: Optional[PydanticObjectId] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None

class InvoiceRead(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    invoice_number: str
    customer_id: PydanticObjectId
    customer_name: str
    items: List[SalesItemRead]
    subtotal: float
    tax_total: float
    grand_total: float
    status: str
    due_date: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}
