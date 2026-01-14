from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.price_list import PriceListCreate, PriceListUpdate, PriceListOut
from ..repositories.master_repos import price_list_repo
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=PriceListOut, dependencies=[Depends(PermissionChecker("price_lists.create"))])
async def create_price_list(data: PriceListCreate):
    return await price_list_repo.create(data)

@router.get("/", response_model=List[PriceListOut], dependencies=[Depends(PermissionChecker("price_lists.view"))])
async def list_price_lists(include_inactive: bool = False):
    return await price_list_repo.list(include_inactive=include_inactive)

@router.get("/{id}", response_model=PriceListOut, dependencies=[Depends(PermissionChecker("price_lists.view"))])
async def get_price_list(id: PydanticObjectId):
    return await price_list_repo.get(id, include_inactive=True)

@router.patch("/{id}", response_model=PriceListOut, dependencies=[Depends(PermissionChecker("price_lists.edit"))])
async def update_price_list(id: PydanticObjectId, data: PriceListUpdate):
    return await price_list_repo.update(id, data)

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("price_lists.delete"))])
async def deactivate_price_list(id: PydanticObjectId):
    return {"success": await price_list_repo.deactivate(id)}
