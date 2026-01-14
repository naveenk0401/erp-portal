from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId
from ..models.user import User
from ..models.sales import Invoice, InvoiceStatus
from ..schemas.sales import InvoiceCreate, InvoiceRead
from ..services.sales_service import sales_service
from ..repositories.sales_repos import invoice_repo
from ..api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=InvoiceRead)
async def create_invoice(
    inv_in: InvoiceCreate,
    current_user: User = Depends(get_current_user)
):
    if not current_user.active_company_id:
        raise HTTPException(status_code=400, detail="No active company")
    return await sales_service.create_invoice(inv_in, current_user.active_company_id)

@router.get("/", response_model=List[InvoiceRead])
async def list_invoices(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return await invoice_repo.list(skip=skip, limit=limit)

@router.post("/{id}/issue", response_model=InvoiceRead)
async def issue_invoice(
    id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    invoice = await invoice_repo.get(id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = InvoiceStatus.ISSUED
    await invoice.save()
    return invoice
