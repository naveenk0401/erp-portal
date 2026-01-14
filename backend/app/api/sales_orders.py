from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId
from ..models.user import User
from ..models.sales import SalesOrder, SalesOrderStatus
from ..schemas.sales import SalesOrderCreate, SalesOrderRead
from ..services.sales_service import sales_service
from ..repositories.sales_repos import sales_order_repo
from ..api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=SalesOrderRead)
async def create_sales_order(
    so_in: SalesOrderCreate,
    current_user: User = Depends(get_current_user)
):
    if not current_user.active_company_id:
        raise HTTPException(status_code=400, detail="No active company")
    return await sales_service.create_sales_order(so_in, current_user.active_company_id)

@router.get("/", response_model=List[SalesOrderRead])
async def list_sales_orders(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return await sales_order_repo.list(skip=skip, limit=limit)

@router.post("/{id}/confirm", response_model=SalesOrderRead)
async def confirm_sales_order(
    id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    order = await sales_order_repo.get(id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = SalesOrderStatus.CONFIRMED
    await order.save()
    return order
