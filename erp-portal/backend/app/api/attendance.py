from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, check_role
from app.models.user import User
from app.models.rbac import RoleEnum
from app.services.attendance_service import AttendanceService
from app.repositories.attendance_repo import AttendanceRepository
from app.core.response import success_response
from beanie.operators import In

router = APIRouter()
attendance_service = AttendanceService(AttendanceRepository())

@router.post("/check-in", response_model=Dict[str, Any])
async def check_in(current_user: User = Depends(get_current_user)):
    attendance = await attendance_service.check_in_user(current_user)
    return success_response(message="Checked in successfully", data=attendance)

@router.post("/check-out", response_model=Dict[str, Any])
async def check_out(current_user: User = Depends(get_current_user)):
    attendance = await attendance_service.check_out_user(current_user)
    return success_response(message="Checked out successfully", data=attendance)

@router.get("/my-attendance", response_model=Dict[str, Any])
async def get_my_attendance(current_user: User = Depends(get_current_user)):
    records = await attendance_service.attendance_repo.get_by_user(str(current_user.id))
    return success_response(message="Attendance records retrieved", data=records)

@router.get("/all", response_model=Dict[str, Any])
async def get_all_attendance(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_role([RoleEnum.SUPER_ADMIN, RoleEnum.DEPARTMENT_HEAD]))
):
    if current_user.role == RoleEnum.SUPER_ADMIN:
        records = await attendance_service.attendance_repo.find_all()
    else:
        # Filter by department
        dept_id = current_user.department.to_ref().id if current_user.department else None
        users_in_dept = await User.find(User.department.id == dept_id).to_list()
        user_ids = [str(u.id) for u in users_in_dept]
        records = await attendance_service.attendance_repo.find_many({"user.$id": {"$in": user_ids}})
    
    return success_response(message="Global attendance retrieved", data=records)

@router.post("/admin-action", response_model=Dict[str, Any])
async def admin_attendance_action(
    user_id: str,
    action: str, # "check-in" or "check-out"
    current_user: User = Depends(check_role([RoleEnum.SUPER_ADMIN]))
):
    target_user = await User.get(user_id)
    if not target_user:
        from app.core.errors import NotFoundException
        raise NotFoundException(message="User not found")
        
    if action == "check-in":
        attendance = await attendance_service.check_in_user(target_user)
    elif action == "check-out":
        attendance = await attendance_service.check_out_user(target_user)
    else:
        from app.core.errors import ERPBaseException
        raise ERPBaseException(message="Invalid action", error_code="INVALID_ACTION", status_code=400)
        
    return success_response(message=f"Admin {action} successful", data=attendance)
