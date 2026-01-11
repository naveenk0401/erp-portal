from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.core.permissions import check_permission
from app.models.user import User
from app.models.rbac import RoleEnum, Scope
from app.models.hr_workflow import OnboardingStatus, OnboardingRequest
from app.services import hr_workflow as hr_service

router = APIRouter()

class DeptCreate(BaseModel):
    name: str
    code: str
    head_id: Optional[str] = None

class OnboardingCreate(BaseModel):
    personal_details: Dict[str, Any]
    department_id: str
    designation: str
    salary_structure: Dict[str, Any]
    bank_details: Dict[str, Any]
    pf_details: Optional[Dict[str, Any]] = None
    esic_details: Optional[Dict[str, Any]] = None
    insurance_details: Optional[Dict[str, Any]] = None
    documents: List[Dict[str, str]] = []

@router.post("/departments")
async def create_department(
    data: DeptCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admin can create departments")
    return await hr_service.create_department(data.name, data.code, data.head_id)

@router.post("/employees/onboarding")
async def start_onboarding(
    data: OnboardingCreate,
    current_user: User = Depends(get_current_user)
):
    # Allowed for Dept Admin or Super Admin
    if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.DEPT_ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return await hr_service.create_onboarding(current_user, data.dict())

@router.put("/employees/submit/{id}")
async def submit_onboarding(
    id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        return await hr_service.submit_onboarding(current_user, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/employees/approve/{id}")
async def approve_onboarding(
    id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admin can approve onboarding")
    try:
        return await hr_service.approve_onboarding(current_user, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/employees/pending-approvals")
async def get_pending_approvals(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.DEPT_ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    query = {"status": OnboardingStatus.SUBMITTED}
    if current_user.role == RoleEnum.DEPT_ADMIN:
        # Filter by department head's department if we had a clean link, 
        # for now we'll assume they see their dept's requests
        # (This is simplified as requested)
        pass
        
    return await OnboardingRequest.find(query).to_list()

@router.get("/employees/{id}")
async def get_onboarding_details(
    id: str,
    current_user: User = Depends(get_current_user)
):
    req = await OnboardingRequest.get(id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Masking logic
    data = req.dict()
    if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.DEPT_ADMIN]:
        # Mask sensitive data
        data["bank_details"] = {k: "***" for k in data["bank_details"]}
        if data.get("pf_details"):
            data["pf_details"] = {k: "***" for k in data["pf_details"]}
            
    return data

@router.get("/employees/{id}/id-card")
async def get_id_card_data(
    id: str,
    current_user: User = Depends(get_current_user)
):
    req = await OnboardingRequest.get(id)
    if not req or req.status != OnboardingStatus.APPROVED:
        raise HTTPException(status_code=404, detail="Approved employee record not found")
        
    return {
        "employee_code": req.employee_code,
        "full_name": req.personal_details.get("full_name"),
        "department": req.department_id,
        "designation": req.designation,
        "doj": req.personal_details.get("doj"),
        "photo_url": next((d["url"] for d in req.documents if d["type"] == "photo"), None)
    }
