from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.auth import get_current_user
from app.core.permissions import check_permission
from app.models.user import User
from app.models.rbac import Scope, RoleEnum, Department
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.audit import log_action
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class InitialSetupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

@router.post("/initial-setup", response_model=UserResponse)
async def initial_setup(user_in: InitialSetupRequest):
    """Create the first super admin user. Only works when no users exist."""
    try:
        # Only allow if no users exist
        count = await User.count()
        if count > 0:
            raise HTTPException(status_code=400, detail="Initial setup already completed")
        
        hashed_pwd = get_password_hash(user_in.password)
        user = User(
            supabase_id=user_in.email,
            email=user_in.email,
            hashed_password=hashed_pwd,
            full_name=user_in.full_name,
            department=Department.ADMIN,
            role=RoleEnum.SUPER_ADMIN
        )
        await user.insert()
        return user
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logger.error(f"Error in initial setup: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    try:
        # Manually construct response to ensure all fields are correct
        return UserResponse(
            id=str(current_user.id),
            supabase_id=current_user.supabase_id,
            email=current_user.email,
            full_name=current_user.full_name,
            salary=current_user.salary,
            status=current_user.status,
            is_active=current_user.is_active,
            role=current_user.role.value if current_user.role else None,
            department=current_user.department.value if current_user.department else None,
            company_id=str(current_user.company.ref.id) if current_user.company else None
        )
    except Exception as e:
        logger.error(f"Error in get_me: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user profile: {str(e)}"
        )

@router.get("/", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("employee.view"))
):
    if scope == Scope.ALL:
        return await User.find_all().to_list()
    elif scope == Scope.DEPARTMENT:
        if not current_user.department:
            raise HTTPException(status_code=403, detail="User has no department")
        return await User.find(User.department.id == current_user.department.id).to_list()
    else: # SELF
        return [current_user]

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("employee.edit"))
):
    target_user = await User.get(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if scope == Scope.DEPARTMENT:
        if not current_user.department or target_user.department.id != current_user.department.id:
            raise HTTPException(status_code=403, detail="Cannot edit users outside your department")
    elif scope == Scope.SELF:
        if str(target_user.id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Can only edit your own profile")

    old_values = target_user.dict()
    update_data = user_update.dict(exclude_unset=True)
    await target_user.update({"$set": update_data})
    
    await log_action(
        user=current_user,
        module="employee",
        action="UPDATE",
        resource_id=user_id,
        old_value=old_values,
        new_value=update_data
    )
    
    return target_user
