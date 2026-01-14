from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.core.auth import get_current_user
from app.models.user import User
from app.models.ops import Project, Sprint, Asset
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    return await Project.find_all().to_list()

@router.post("/projects")
async def create_project(project: Project, current_user: User = Depends(get_current_user)):
    project.manager = current_user
    await project.insert()
    return project

@router.get("/assets", response_model=List[Asset])
async def get_assets(current_user: User = Depends(get_current_user)):
    if current_user.role in ["admin", "hr"]:
        return await Asset.find_all().to_list()
    return await Asset.find(Asset.assigned_to == current_user.id).to_list()
