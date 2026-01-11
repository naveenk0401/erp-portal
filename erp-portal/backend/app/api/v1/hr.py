from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.core.auth import get_current_user
from app.core.permissions import check_permission
from app.models.user import User
from app.models.rbac import Scope
from app.services import hr as hr_service

router = APIRouter()

@router.get("/dashboard/kpis")
async def get_hr_kpis(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_hr_kpis(dept)

@router.get("/dashboard/attendance")
async def get_attendance_insights(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_attendance_insights(dept)

@router.get("/dashboard/lifecycle")
async def get_employee_lifecycle(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_employee_lifecycle(dept)

@router.get("/dashboard/performance")
async def get_performance_insights(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_performance_insights(dept)

@router.get("/dashboard/compliance")
async def get_compliance_status(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_compliance_status(dept)

@router.get("/dashboard/alerts")
async def get_hr_alerts(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("hr.view"))
):
    dept = current_user.department if scope == Scope.DEPARTMENT else None
    return await hr_service.get_hr_alerts(dept)
