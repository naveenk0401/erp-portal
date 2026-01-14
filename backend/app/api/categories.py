from fastapi import APIRouter, Depends, Query
from typing import List
from beanie import PydanticObjectId
from ..schemas.category import ItemCategoryCreate, ItemCategoryUpdate, ItemCategoryOut
from ..repositories.master_repos import category_repo
from ..services.master_service import master_service
from ..api.deps import PermissionChecker

router = APIRouter()

@router.post("/", response_model=ItemCategoryOut, dependencies=[Depends(PermissionChecker("categories.create"))])
async def create_category(data: ItemCategoryCreate):
    return await master_service.create_category(data)

@router.get("/", response_model=List[ItemCategoryOut], dependencies=[Depends(PermissionChecker("categories.view"))])
async def list_categories(
    skip: int = 0, 
    limit: int = 100, 
    search: str = Query(None),
    include_inactive: bool = False
):
    query = category_repo.query()
    if not include_inactive:
        query = query.find(category_repo.model.is_active == True)
    if search:
        query = query.find({"name": {"$regex": search, "$options": "i"}})
    return await query.skip(skip).limit(limit).to_list()

@router.delete("/{id}", dependencies=[Depends(PermissionChecker("categories.delete"))])
async def delete_category(id: PydanticObjectId):
    return {"success": await master_service.delete_category(id)}
