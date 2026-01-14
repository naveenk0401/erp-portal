from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut
from ..repositories.master_repos import customer_repo
from ..services.master_service import master_service
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=CustomerOut, dependencies=[Depends(PermissionChecker("customers.create"))])
async def create_customer(data: CustomerCreate):
    return await master_service.create_customer(data)

@router.get("/", response_model=List[CustomerOut], dependencies=[Depends(PermissionChecker("customers.view"))])
async def list_customers(
    skip: int = 0, 
    limit: int = 100, 
    search: str = Query(None),
    include_inactive: bool = False
):
    query = customer_repo.query()
    if not include_inactive:
        query = query.find(customer_repo.model.is_active == True)
    if search:
        query = query.find({"name": {"$regex": search, "$options": "i"}})
    return await query.skip(skip).limit(limit).to_list()

@router.get("/{id}", response_model=CustomerOut, dependencies=[Depends(PermissionChecker("customers.view"))])
async def get_customer(id: PydanticObjectId):
    return await customer_repo.get(id, include_inactive=True)

@router.patch("/{id}", response_model=CustomerOut, dependencies=[Depends(PermissionChecker("customers.edit"))])
async def update_customer(id: PydanticObjectId, data: CustomerUpdate):
    return await customer_repo.update(id, data)

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("customers.delete"))])
async def deactivate_customer(id: PydanticObjectId):
    return {"success": await customer_repo.deactivate(id)}

@router.post("/{id}/activate", dependencies=[Depends(PermissionChecker("customers.edit"))])
async def activate_customer(id: PydanticObjectId):
    return {"success": await customer_repo.activate(id)}
