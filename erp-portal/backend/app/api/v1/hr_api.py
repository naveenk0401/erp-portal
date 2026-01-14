from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.core.auth import get_current_user
from app.models.user import User
from app.models.hr import Leave, IDCard
from app.models.onboarding import Onboarding
from app.models.approvals import ApprovalRequest
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/leaves", response_model=List[Leave])
async def get_leaves(current_user: User = Depends(get_current_user)):
    """Get leaves for the current user or all if HR/Admin"""
    if current_user.role in ["hr", "admin"]:
        return await Leave.find_all().to_list()
    return await Leave.find(Leave.user == current_user.id).to_list()

@router.post("/leaves")
async def apply_leave(leave: Leave, current_user: User = Depends(get_current_user)):
    """Apply for a leave"""
    leave.user = current_user
    leave.status = "pending"
    await leave.insert()
    
    # Create an approval request
    approval = ApprovalRequest(
        requester=current_user,
        module="leave",
        resource_id=str(leave.id),
        data_snapshot=leave.dict()
    )
    await approval.insert()
    return leave

@router.get("/id-card")
async def get_id_card(current_user: User = Depends(get_current_user)):
    """Get current user's ID card"""
    card = await IDCard.find_one(IDCard.user == current_user.id)
    if not card:
        raise HTTPException(status_code=404, detail="ID Card not found")
    return card

@router.get("/employees", response_model=List[User])
async def list_employees(current_user: User = Depends(get_current_user)):
    """List all employees (HR/Admin only)"""
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await User.find_all().to_list()

@router.get("/operations")
async def get_hr_ops(current_user: User = Depends(get_current_user)):
    """Get HR operations summary"""
    return {
        "onboarding_active": await Onboarding.find(Onboarding.status == "Draft").count(),
        "leaves_pending": await Leave.find(Leave.status == "pending").count(),
        "total_employees": await User.find_all().count()
    }
