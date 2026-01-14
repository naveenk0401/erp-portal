from typing import List, Optional
from datetime import datetime, date
from beanie import PydanticObjectId, Indexed
from pydantic import Field, BaseModel
from .base import TenantDocument

class SalesItem(BaseModel):
    item_id: PydanticObjectId
    name: str  # Snapshotted at time of creation
    qty: float
    price: float
    unit: str
    tax_ids: List[PydanticObjectId] = []
    tax_amount: float = 0.0
    line_total: float = 0.0

class QuotationStatus(str):
    DRAFT = "DRAFT"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class Quotation(TenantDocument):
    quote_number: Indexed(str, unique=True)
    customer_id: PydanticObjectId
    customer_name: str  # Snapshotted
    items: List[SalesItem]
    subtotal: float
    tax_total: float
    grand_total: float
    status: str = QuotationStatus.DRAFT
    valid_until: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Settings:
        name = "quotations"

class SalesOrderStatus(str):
    DRAFT = "DRAFT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class SalesOrder(TenantDocument):
    order_number: Indexed(str, unique=True)
    customer_id: PydanticObjectId
    customer_name: str
    quotation_id: Optional[PydanticObjectId] = None
    items: List[SalesItem]
    subtotal: float
    tax_total: float
    grand_total: float
    status: str = SalesOrderStatus.DRAFT
    notes: Optional[str] = None

    class Settings:
        name = "sales_orders"

class InvoiceStatus(str):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class Invoice(TenantDocument):
    invoice_number: Indexed(str, unique=True)
    customer_id: PydanticObjectId
    customer_name: str
    sales_order_id: Optional[PydanticObjectId] = None
    items: List[SalesItem]
    subtotal: float
    tax_total: float
    grand_total: float
    due_date: Optional[datetime] = None
    status: str = InvoiceStatus.DRAFT
    notes: Optional[str] = None

    class Settings:
        name = "invoices"

class CreditNote(TenantDocument):
    credit_note_number: Indexed(str, unique=True)
    invoice_id: PydanticObjectId
    amount: float
    reason: str
    status: str = "ISSUED"

    class Settings:
        name = "credit_notes"
