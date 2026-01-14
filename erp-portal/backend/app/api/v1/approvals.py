from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.core.auth import get_current_user
from app.models.user import User
from app.models.approvals import ApprovalRequest

router = APIRouter()

@router.get("/", response_model=List[ApprovalRequest])
async def get_approvals(current_user: User = Depends(get_current_user)):
    if current_user.role in ["hr", "admin", "finance", "manager"]:
        # Show requests where current user is an approver or all if admin
        return await ApprovalRequest.find_all().to_list()
    return await ApprovalRequest.find(ApprovalRequest.requester == current_user.id).to_list()

@router.patch("/{id}")
async def update_approval_status(id: str, status: str, comment: Optional[str] = None, current_user: User = Depends(get_current_user)):
    approval = await ApprovalRequest.get(id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    approval.status = status
    if comment:
        approval.comments.append({
            "user_id": str(current_user.id),
            "comment": comment,
            "timestamp": datetime.utcnow()
        })
    await approval.save()
    return approval
