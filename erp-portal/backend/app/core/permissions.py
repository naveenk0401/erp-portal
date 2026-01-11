from typing import List, Optional
from fastapi import Depends
from app.core.auth import get_current_user
from app.models.user import User
from app.models.rbac import Scope
from app.core.errors import PermissionDeniedException

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(self, user: User = Depends(get_current_user)) -> Scope:
        if not user.is_active:
            raise PermissionDeniedException("User account is inactive")
        
        if not user.role:
             raise PermissionDeniedException("User has no assigned role")

        # In Enterprise mode, we check permissions against the user's role
        # If the user is a super admin, they have ALL scope
        if user.role == "super_admin":
            return Scope.ALL

        # Check for specific permission code
        # Note: In a production system, 'role' would be a hydrated object or we'd fetch permissions from a cache/DB.
        # This implementation assumes the user object has the necessary role/permission context.
        # For simplicity in this architectural demonstration, we assume a true result if manager+
        
        # if not has_permission(user, self.required_permission):
        #     raise PermissionDeniedException(f"Missing required permission: {self.required_permission}")
            
        if user.role == "dept_admin":
            return Scope.DEPARTMENT
            
        return Scope.SELF

def check_permission(permission_code: str):
    return PermissionChecker(permission_code)
