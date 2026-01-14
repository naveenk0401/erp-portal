from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.item import ItemCreate, ItemUpdate, ItemOut
from ..repositories.master_repos import item_repo
from ..services.master_service import master_service
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=ItemOut, dependencies=[Depends(PermissionChecker("items.create"))])
async def create_item(data: ItemCreate):
    return await master_service.create_item(data)

@router.get("/", response_model=List[ItemOut], dependencies=[Depends(PermissionChecker("items.view"))])
async def list_items(
    skip: int = 0, 
    limit: int = 100, 
    search: str = Query(None),
    item_type: str = Query(None),
    include_inactive: bool = False
):
    query = item_repo.query()
    if not include_inactive:
        query = query.find(item_repo.model.is_active == True)
    if search:
        query = query.find({"name": {"$regex": search, "$options": "i"}})
    if item_type:
        query = query.find(item_repo.model.item_type == item_type)
    return await query.skip(skip).limit(limit).to_list()

@router.get("/{id}", response_model=ItemOut, dependencies=[Depends(PermissionChecker("items.view"))])
async def get_item(id: PydanticObjectId):
    return await item_repo.get(id, include_inactive=True)

@router.patch("/{id}", response_model=ItemOut, dependencies=[Depends(PermissionChecker("items.edit"))])
async def update_item(id: PydanticObjectId, data: ItemUpdate):
    return await master_service.update_item(id, data)

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("items.delete"))])
async def deactivate_item(id: PydanticObjectId):
    return {"success": await item_repo.deactivate(id)}
