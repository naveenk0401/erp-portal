from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from ..models.user import User
from ..models.role import Role
from ..models.company import Company
from .deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class DashboardStats(BaseModel):
    user_count: int
    role_count: int
    company_name: str

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get dynamic statistics for the dashboard of the active company.
    """
    if not current_user.active_company_id:
        raise HTTPException(status_code=400, detail="No active company selected")
    
    cid = current_user.active_company_id

    # Get user count for this company
    user_count = await User.find(User.company_ids == cid).count()

    # Get role count for this company
    role_count = await Role.find(Role.company_id == cid).count()

    # Get company name
    company = await Company.get(cid)
    company_name = company.name if company else "Unknown Workspace"

    return DashboardStats(
        user_count=user_count,
        role_count=role_count,
        company_name=company_name
    )
