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
    current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPARTMENT_HEAD]))
):
    assigned_user = await User.get(assigned_to_id)
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    if current_user.role == RoleEnum.DEPARTMENT_HEAD:
        c_dept_id = current_user.department.to_ref().id if current_user.department else None
        a_dept_id = assigned_user.department.to_ref().id if assigned_user.department else None
        if a_dept_id != c_dept_id:
            raise HTTPException(status_code=403, detail="Can only assign tasks to your department")

    task = Task(
        title=title,
        description=description,
        assigned_to=assigned_user,
        created_by=current_user,
        department=assigned_user.department
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
    
    if task.assigned_to.to_ref().id != current_user.id and current_user.role == RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    task.status = status
    await task.save()
    return task

@router.get("/all")
async def get_all_tasks(current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPARTMENT_HEAD]))):
    if current_user.role == RoleEnum.SUPER_ADMIN:
        return await Task.find_all(fetch_links=True).to_list()
    
    # Dept Head sees tasks for their dept
    dept_id = current_user.department.to_ref().id if current_user.department else None
    return await Task.find(Task.department.id == dept_id, fetch_links=True).to_list()
