from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.vendor import VendorCreate, VendorUpdate, VendorOut
from ..repositories.master_repos import vendor_repo
from ..services.master_service import master_service
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=VendorOut, dependencies=[Depends(PermissionChecker("vendors.create"))])
async def create_vendor(data: VendorCreate):
    return await master_service.create_vendor(data)

@router.get("/", response_model=List[VendorOut], dependencies=[Depends(PermissionChecker("vendors.view"))])
async def list_vendors(
    skip: int = 0, 
    limit: int = 100, 
    search: str = Query(None),
    include_inactive: bool = False
):
    query = vendor_repo.query()
    if not include_inactive:
        query = query.find(vendor_repo.model.is_active == True)
    if search:
        query = query.find({"name": {"$regex": search, "$options": "i"}})
    return await query.skip(skip).limit(limit).to_list()

@router.get("/{id}", response_model=VendorOut, dependencies=[Depends(PermissionChecker("vendors.view"))])
async def get_vendor(id: PydanticObjectId):
    return await vendor_repo.get(id, include_inactive=True)

@router.patch("/{id}", response_model=VendorOut, dependencies=[Depends(PermissionChecker("vendors.edit"))])
async def update_vendor(id: PydanticObjectId, data: VendorUpdate):
    return await vendor_repo.update(id, data)

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("vendors.delete"))])
async def deactivate_vendor(id: PydanticObjectId):
    return {"success": await vendor_repo.deactivate(id)}
