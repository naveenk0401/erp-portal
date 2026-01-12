from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import User
from app.models.rbac import RoleEnum, Scope

ROLE_LEVELS = {
    RoleEnum.SUPER_ADMIN: 1,
    RoleEnum.ADMIN: 1,
    RoleEnum.DEPARTMENT_HEAD: 2,
    RoleEnum.DEPT_ADMIN: 2,
    RoleEnum.HR: 2,
    RoleEnum.ACCOUNTANT: 2,
    RoleEnum.FINANCE: 2,
    RoleEnum.DEPARTMENT_MANAGER: 3,
    RoleEnum.MANAGER: 3,
    RoleEnum.TEAM_LEAD: 4,
    RoleEnum.EMPLOYEE: 5
}

def check_permission(permission_code: str):
    """
    Dependency that checks if the user has a specific permission or high enough role.
    For legacy support, it also returns a Scope.
    """
    async def permission_dependency(user: User = Depends(get_current_user)):
        # Super Admin has all permissions
        if user.role == RoleEnum.SUPER_ADMIN:
            return Scope.ALL
            
        # For now, we use role level as a proxy for permissions
        # In a full RBAC system, we would check user.role.permissions
        user_level = ROLE_LEVELS.get(user.role, 5)
        
        # High level roles (Admin/Head) get DEPARTMENT scope
        if user_level <= 2:
            return Scope.DEPARTMENT
            
        # Manager/TL get DEPARTMENT scope but filtered in service
        if user_level <= 4:
            return Scope.DEPARTMENT
            
        return Scope.SELF

    return permission_dependency

class PermissionChecker:
    def __init__(self, required_role: RoleEnum = None, min_level: int = 5):
        self.required_role = required_role
        self.min_level = min_level

    async def __call__(self, user: User = Depends(get_current_user)):
        user_level = ROLE_LEVELS.get(user.role, 5)
        
        # Super Admin override
        if user.role == RoleEnum.SUPER_ADMIN:
            return user

        # Check explicit role requirement
        if self.required_role and user.role != self.required_role:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires {self.required_role} role"
            )

        # Check hierarchy level
        if user_level > self.min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permission level"
            )
            
        return user

def check_hierarchy(superior: User, subordinate: User):
    """
    Validates that superior is actually above subordinate in the hierarchy
    """
    if superior.role == RoleEnum.SUPER_ADMIN:
        return True
        
    sup_level = ROLE_LEVELS.get(superior.role, 5)
    sub_level = ROLE_LEVELS.get(subordinate.role, 5)
    
    # Must be at least one level above
    if sup_level >= sub_level:
        return False
        
    # Same department check (mandatory for non-Super Admin)
    sup_dept_id = superior.department.to_ref().id if superior.department else None
    sub_dept_id = subordinate.department.to_ref().id if subordinate.department else None
    
    if sup_dept_id != sub_dept_id:
        return False
        
    return True
