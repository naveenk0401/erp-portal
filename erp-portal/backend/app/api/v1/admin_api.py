from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.core.auth import get_current_user
from app.models.user import User
from app.models.engine import AuditLog

router = APIRouter()

@router.get("/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        return await AuditLog.find(AuditLog.user_id == str(current_user.id)).to_list()
    return await AuditLog.find_all().to_list()

@router.get("/reports")
async def get_reports_summary():
    return [
        {"id": "R001", "name": "Monthly Payroll Report", "type": "Finance"},
        {"id": "R002", "name": "Employee Performance Review", "type": "HR"},
        {"id": "R003", "name": "Project Velocity Report", "type": "Operations"}
    ]

@router.get("/verify")
async def verify_service():
    return {"status": "ready", "services": ["biometric", "document", "background"]}
