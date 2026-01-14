from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId
from ..models.user import User
from ..models.sales import Quotation, QuotationStatus
from ..schemas.sales import QuotationCreate, QuotationRead
from ..services.sales_service import sales_service
from ..repositories.sales_repos import quotation_repo
from ..api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=QuotationRead)
async def create_quotation(
    q_in: QuotationCreate,
    current_user: User = Depends(get_current_user)
):
    if not current_user.active_company_id:
        raise HTTPException(status_code=400, detail="No active company")
    return await sales_service.create_quotation(q_in, current_user.active_company_id)

@router.get("/", response_model=List[QuotationRead])
async def list_quotations(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return await quotation_repo.list(skip=skip, limit=limit)

@router.get("/{id}", response_model=QuotationRead)
async def get_quotation(
    id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    quotation = await quotation_repo.get(id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation

@router.post("/{id}/accept", response_model=QuotationRead)
async def accept_quotation(
    id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    quotation = await quotation_repo.get(id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    quotation.status = QuotationStatus.ACCEPTED
    await quotation.save()
    return quotation
