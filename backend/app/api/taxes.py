from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.tax import TaxCreate, TaxUpdate, TaxOut
from ..repositories.master_repos import tax_repo
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=TaxOut, dependencies=[Depends(PermissionChecker("taxes.create"))])
async def create_tax(data: TaxCreate):
    return await tax_repo.create(data)

@router.get("/", response_model=List[TaxOut], dependencies=[Depends(PermissionChecker("taxes.view"))])
async def list_taxes(include_inactive: bool = False):
    return await tax_repo.list(include_inactive=include_inactive)

@router.patch("/{id}", response_model=TaxOut, dependencies=[Depends(PermissionChecker("taxes.edit"))])
async def update_tax(id: PydanticObjectId, data: TaxUpdate):
    return await tax_repo.update(id, data)

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("taxes.delete"))])
async def deactivate_tax(id: PydanticObjectId):
    return {"success": await tax_repo.deactivate(id)}
