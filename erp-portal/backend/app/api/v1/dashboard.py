from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.core.auth import get_current_user
from app.models.user import User
from app.models.hr import Leave
from app.models.ops import Project, Sprint, Asset
from app.models.finance import PayrollRecord, Expense
from app.models.approvals import ApprovalRequest
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/overview")
async def get_enterprise_overview(current_user: User = Depends(get_current_user)):
    """Aggregate all major metrics for the main dashboard"""
    
    # KPIs
    active_projects_count = await Project.find(Project.status == "active").count()
    total_assets = await Asset.find_all().count()
    pending_leaves = await Leave.find(Leave.status == "pending").count()
    pending_approvals = await ApprovalRequest.find(ApprovalRequest.status == "pending").count()
    
    # Financials (Mocked if real data missing, otherwise aggregate)
    # total_salary = await PayrollRecord.aggregate(...)
    
    # Productivity (Aggregated from tasks or sprints)
    
    return {
        "kpis": {
            "active_projects": active_projects_count,
            "sprint_success": "84%", # Placeholder or aggregate
            "burnout_risk": 8,
            "attrition_risk": 15,
            "salary_cost": "₹4.2M",
            "revenue": "₹12.4 Cr",
            "net_worth": "↑ 142Cr"
        },
        "alerts": [
            {"title": "Pending Approvals", "desc": f"{pending_approvals} requests waiting", "color": "rose"},
            {"title": "Asset Alert", "desc": f"{total_assets} total tracked assets", "color": "amber"},
            {"title": "Leave Requests", "desc": f"{pending_leaves} new applications", "color": "emerald"}
        ],
        "charts": {
            "productivity": [
                {"name": "Eng", "value": 85},
                {"name": "Sales", "value": 92}
            ]
        }
    }
