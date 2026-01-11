from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user, check_role
from app.models.user import User
from app.models.rbac import Role, Department, RoleEnum
from app.models.task import Task, TaskStatus
from beanie import PydanticObjectId
from beanie.operators import In

router = APIRouter()

@router.post("/")
async def create_task(
    title: str, 
    description: str, 
    assigned_to_id: str,
    current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPT_ADMIN]))
):
    assigned_user = await User.get(assigned_to_id)
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    if current_user.role == RoleEnum.DEPT_ADMIN and assigned_user.department != current_user.department:
        raise HTTPException(status_code=403, detail="Can only assign tasks to your department")

    task = Task(
        title=title,
        description=description,
        assigned_to=assigned_user,
        created_by=current_user
    )
    await task.insert()
    return task

@router.get("/my-tasks")
async def get_my_tasks(current_user: User = Depends(get_current_user)):
    return await Task.find(Task.assigned_to.id == current_user.id).to_list()

@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: str,
    status: TaskStatus,
    current_user: User = Depends(get_current_user)
):
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.assigned_to.id != current_user.id and current_user.role == RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    task.status = status
    await task.save()
    return task

@router.get("/all")
async def get_all_tasks(current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPT_ADMIN]))):
    if current_user.role == RoleEnum.SUPER_ADMIN:
        return await Task.find_all(fetch_links=True).to_list()
    
    # Dept Admin sees tasks for their dept
    users_in_dept = await User.find(User.department == current_user.department).to_list()
    user_ids = [u.id for u in users_in_dept]
    return await Task.find(In(Task.assigned_to.id, user_ids), fetch_links=True).to_list()
