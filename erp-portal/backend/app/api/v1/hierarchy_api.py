from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.models.user import User
from app.models.rbac import RoleEnum, Department
from app.core.permissions import PermissionChecker
from app.services.task_service import task_service
from app.core.response import success_response, StandardResponse

router = APIRouter()

# --- Department Management (Super Admin Only) ---

@router.post("/departments", response_model=StandardResponse)
async def create_department(
    dept_data: Dict[str, Any], 
    current_user: User = Depends(PermissionChecker(required_role=RoleEnum.SUPER_ADMIN))
):
    dept = Department(**dept_data)
    await dept.insert()
    return success_response(message="Department created", data=dept)

@router.get("/departments", response_model=List[Department])
async def list_departments(current_user: User = Depends(PermissionChecker(min_level=5))):
    return await Department.find_all().to_list()

# --- User/Employee Management ---

@router.post("/users", response_model=StandardResponse)
async def create_user(
    user_data: Dict[str, Any],
    current_user: User = Depends(PermissionChecker(min_level=3)) # Manager or above
):
    # Validations would go here (Supabase sync, etc)
    # This is a placeholder for the wiring
    return success_response(message="User created (Placeholder)")

# --- Hierarchical Task Management ---

@router.post("/tasks/assign", response_model=StandardResponse)
async def assign_hierarchical_task(
    task_data: Dict[str, Any], 
    current_user: User = Depends(PermissionChecker(min_level=4)) # Team Lead or above
):
    task = await task_service.assign_task(current_user, task_data)
    return success_response(message="Task assigned successfully", data=task)

@router.get("/tasks", response_model=StandardResponse)
async def get_hierarchical_tasks(current_user: User = Depends(PermissionChecker(min_level=5))):
    tasks = await task_service.get_my_tasks(current_user)
    return success_response(data=tasks)
