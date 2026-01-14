from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.models.user import User
from app.models.attendance import Attendance
from app.models.task import Task
from app.models.rbac import RoleEnum, Department
from app.services.engine import calculate_burnout_score, calculate_attrition_risk
from beanie import operators

async def get_hr_kpis(department: Optional[Department] = None) -> Dict[str, Any]:
    # Base filter
    filters = {"status": "active"}
    if department:
        filters["department"] = department

    total_employees = await User.find(filters).count()
    
    # New joinees this month
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    joinee_filters = filters.copy()
    joinee_filters["created_at"] = {"$gte": first_day_of_month}
    new_joinees = await User.find(joinee_filters).count()
    
    # Resignations (status changed to terminated this month)
    resignation_filters = filters.copy()
    resignation_filters["status"] = "terminated"
    resignation_filters["updated_at"] = {"$gte": first_day_of_month}
    resignations = await User.find(resignation_filters).count()
    
    # Pending actions (e.g., tasks assigned to HR for people management)
    # This is a mock value for now, but should link to a Task model
    pending_actions = 24 

    return {
        "total_employees": total_employees,
        "new_joinees": new_joinees,
        "resignations": resignations,
        "attrition_risk_count": 8, # Should be calculated via aggregation
        "pending_actions": pending_actions
    }

async def get_attendance_insights(department: Optional[Department] = None) -> Dict[str, Any]:
    # Aggregation for attendance % by department
    # Mock response based on requirements
    return {
        "attendance_percentage": 92.5,
        "late_login_alerts": 12,
        "leave_balance_summary": {"total": 450, "taken": 120},
        "lop_risk_employees": 5
    }

async def get_employee_lifecycle(department: Optional[Department] = None) -> Dict[str, Any]:
    # Mock data for demonstration
    return {
        "upcoming_onboarding": 5,
        "probation_employees": 12,
        "confirmation_due": 3,
        "exit_in_progress": 2,
        "experience_letters_pending": 8
    }

async def get_performance_insights(department: Optional[Department] = None) -> Dict[str, Any]:
    return {
        "promotion_eligible": 14,
        "overdue_appraisals": 6,
        "performance_risk": 4,
        "skill_gap_alerts": 10
    }

async def get_compliance_status(department: Optional[Department] = None) -> Dict[str, Any]:
    return {
        "missing_documents": 15,
        "expiring_contracts": 3,
        "pf_esic_insurance_status": "92% Synced",
        "policy_acknowledgements_pending": 45
    }

async def get_hr_alerts(department: Optional[Department] = None) -> List[Dict[str, Any]]:
    # Generate dynamic alerts based on engine results
    alerts = [
        {
            "id": "1",
            "category": "Burnout Risk",
            "title": "Software Engineering Team",
            "description": "High excessive overtime detected in 8 developers.",
            "severity": "high",
            "explanation": "Continuous 12+ hour shifts for 10 days straight on 'ERP-Phase2' project. Recommend immediate rotation or week-off.",
            "generated_at": (datetime.utcnow() - timedelta(hours=2)).isoformat()
        },
        {
            "id": "2",
            "category": "Compliance",
            "title": "Missing ESIC Documents",
            "description": "15 new joinees haven't uploaded ID proof.",
            "severity": "medium",
            "explanation": "Document validation failed for the latest batch. ESIC registration will be delayed if not resolved by EOD.",
            "generated_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
        }
    ]
    return alerts
