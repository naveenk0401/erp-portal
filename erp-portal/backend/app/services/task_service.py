from typing import List, Optional
from datetime import datetime
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.models.rbac import RoleEnum
from app.core.permissions import ROLE_LEVELS
from fastapi import HTTPException, status

class TaskService:
    async def assign_task(self, creator: User, task_data: dict) -> Task:
        assignee_id = task_data.get("assigned_to_id")
        assignee = await User.get(assignee_id)
        
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

        # 1. Hierarchy Validation
        creator_level = ROLE_LEVELS.get(creator.role, 5)
        assignee_level = ROLE_LEVELS.get(assignee.role, 5)

        # Super Admin can assign to anyone
        if creator.role != RoleEnum.SUPER_ADMIN:
            # Must be one level above
            if assignee_level != creator_level + 1:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail=f"As a {creator.role}, you can only assign tasks to {list(ROLE_LEVELS.keys())[creator_level]}"
                )

            # Department Check
            creator_dept = creator.department.to_ref().id if creator.department else None
            assignee_dept = assignee.department.to_ref().id if assignee.department else None
            
            if creator_dept != assignee_dept:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot assign tasks across departments"
                )

        # 2. Create Task
        new_task = Task(
            title=task_data["title"],
            description=task_data["description"],
            assigned_to=assignee,
            created_by=creator,
            department=assignee.department,
            assigned_role_level=assignee.role,
            priority=task_data.get("priority", "medium"),
            due_date=task_data.get("due_date"),
            audit_trail=[{
                "action": "created",
                "by": str(creator.id),
                "at": datetime.utcnow().isoformat(),
                "details": f"Task assigned to {assignee.full_name}"
            }]
        )
        
        await new_task.insert()
        return new_task

    async def get_my_tasks(self, user: User) -> List[Task]:
        if user.role == RoleEnum.SUPER_ADMIN:
            return await Task.find_all().to_list()
            
        # Department Head sees all department tasks
        if user.role == RoleEnum.DEPARTMENT_HEAD:
            dept_id = user.department.to_ref().id if user.department else None
            return await Task.find(Task.department.id == dept_id).to_list()

        # Others see tasks assigned to them
        return await Task.find(Task.assigned_to.id == user.id).to_list()

task_service = TaskService()
