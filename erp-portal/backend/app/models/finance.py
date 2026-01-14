from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class Expense(Document):
    user: Link[User]
    amount: float
    category: str
    description: str
    receipt_url: Optional[str] = None
    status: str = "approved" # pending, approved, reimbursed, rejected
    approved_by: Optional[Link[User]] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "expenses"

class Invoice(Document):
    # Header Details
    invoice_number: str = Field(default_factory=lambda: f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}")
    status: str = "paid" # pending, paid, overdue, cancelled
    due_date: datetime
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Parties
    from_company: Dict[str, Any] = {} # {name, address, gst, contact_person, email}
    to_company: Dict[str, Any] = {} # {name, address, gst, contact_person, email}
    
    # Financials
    items: List[Dict[str, Any]] = [] # [{description, hsn_sac, quantity, rate, amount, tax_rate}]
    subtotal: float = 0.0
    tax_total: float = 0.0
    grand_total: float = 0.0
    currency: str = "INR"
    
    # Meta
    payment_details: Dict[str, Any] = {} # {bank_name, account_no, ifsc, mode}
    order_details: Dict[str, Any] = {} # {po_number, po_date}
    terms_conditions: str = "Payment due within 30 days."
    notes: Optional[str] = None

    class Settings:
        name = "invoices"

class PayrollRecord(Document):
    user: Link[User]
    base_salary: float
    allowances: float = 0.0
    deductions: float = 0.0
    net_salary: float
    month: int
    year: int
    status: str = "processed" # processed, paid, on_hold
    processed_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payroll_records"
