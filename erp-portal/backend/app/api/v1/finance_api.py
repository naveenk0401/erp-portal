from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.auth import get_current_user
from app.models.user import User
from app.models.finance import Expense, PayrollRecord, Invoice
from app.services.finance_service import finance_service
from app.core.response import success_response, StandardResponse

router = APIRouter()

@router.get("/summary")
async def get_finance_summary(period: str = "year", current_user: User = Depends(get_current_user)):
    """Get summarized financial metrics"""
    # Trigger seeding if empty
    await finance_service.seed_demo_data()
    summary = await finance_service.get_summary(period=period)
    return summary

@router.get("/audit/export")
async def export_audit_excel(current_user: User = Depends(get_current_user)):
    excel_buffer = await finance_service.generate_audit_excel_bytes()
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=financial_audit_{datetime.utcnow().year}.xlsx"}
    )

from fastapi.responses import StreamingResponse

@router.get("/invoices/{invoice_id}/pdf")
async def generate_invoice_pdf(invoice_id: str, current_user: User = Depends(get_current_user)):
    pdf_buffer = await finance_service.generate_pdf_bytes(invoice_id)
    if not pdf_buffer:
        return {"error": "Invoice not found"}
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"}
    )

@router.get("/expenses", response_model=List[Expense])
async def get_expenses(current_user: User = Depends(get_current_user)):
    if current_user.role in ["super_admin", "accountant", "finance", "admin"]:
        return await Expense.find_all().to_list()
    return await Expense.find(Expense.user == current_user.id).to_list()

@router.post("/expenses", response_model=StandardResponse)
async def create_expense(expense_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    expense_data["user"] = current_user
    expense = Expense(**expense_data)
    await expense.insert()
    return success_response(message="Expense recorded", data=expense)

@router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    return await Invoice.find_all().to_list()

@router.post("/invoices", response_model=StandardResponse)
async def create_invoice(invoice_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only admins can issue invoices")
    
    invoice = Invoice(**invoice_data)
    await invoice.insert()
    return success_response(message="Invoice created", data=invoice)

@router.get("/payroll", response_model=List[PayrollRecord])
async def get_payroll(current_user: User = Depends(get_current_user)):
    return await PayrollRecord.find(PayrollRecord.user == current_user.id).to_list()
