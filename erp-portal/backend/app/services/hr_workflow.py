from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.hr_workflow import Department, OnboardingRequest, OnboardingStatus
from app.models.user import User
from app.models.engine import AuditLog
from app.models.rbac import RoleEnum, Department as DeptEnum
from app.core.security import get_password_hash
from beanie import PydanticObjectId

async def create_department(name: str, code: str, head_id: Optional[str] = None) -> Department:
    head = None
    if head_id:
        head = await User.get(head_id)
    
    dept = Department(name=name, code=code, head=head)
    await dept.insert()
    return dept

async def create_onboarding(user: User, data: Dict[str, Any]) -> OnboardingRequest:
    req = OnboardingRequest(
        **data,
        created_by=user,
        status=OnboardingStatus.DRAFT
    )
    await req.insert()
    
    await log_hr_action(user, "CREATE", str(req.id), None, data)
    return req

async def submit_onboarding(user: User, request_id: str) -> OnboardingRequest:
    req = await OnboardingRequest.get(request_id)
    if not req:
        raise ValueError("Onboarding request not found")
    
    old_status = req.status
    req.status = OnboardingStatus.SUBMITTED
    req.updated_at = datetime.utcnow()
    await req.save()
    
    await log_hr_action(user, "SUBMIT", str(req.id), {"status": old_status}, {"status": req.status})
    return req

async def approve_onboarding(admin_user: User, request_id: str) -> OnboardingRequest:
    req = await OnboardingRequest.get(request_id, fetch_links=True)
    if not req:
        raise ValueError("Onboarding request not found")
    
    if req.status != OnboardingStatus.SUBMITTED:
        raise ValueError("Only submitted requests can be approved")

    # Generate Employee Code: EMP-{DEPT}-{SEQUENCE}
    dept = await Department.get(req.department_id)
    dept_code = dept.code if dept else "GEN"
    
    # Count approved for this dept to get sequence
    count = await OnboardingRequest.find(
        OnboardingRequest.department_id == req.department_id,
        OnboardingRequest.status == OnboardingStatus.APPROVED
    ).count()
    
    emp_code = f"EMP-{dept_code}-{(count + 1):05d}"
    
    # Update Request
    req.status = OnboardingStatus.APPROVED
    req.approved_by = admin_user
    req.approved_at = datetime.utcnow()
    req.employee_code = emp_code
    await req.save()

    # Create/Update User profile
    # If email exists, we update, otherwise we create.
    email = req.personal_details.get("email")
    user = await User.find_one(User.email == email)
    
    if not user:
        # Create user for login if it doesn't exist
        user = User(
            supabase_id=email, # Defaulting to email as fallback for mock
            email=email,
            hashed_password=get_password_hash("Welcome@123"), # Default password
            full_name=req.personal_details.get("full_name"),
            role=RoleEnum.EMPLOYEE,
            department=DeptEnum(dept.code.lower()) if dept else None,
            is_active=True,
            salary=float(req.salary_structure.get("base", 0))
        )
        await user.insert()
    else:
        # Update existing user
        user.is_active = True
        user.salary = float(req.salary_structure.get("base", 0))
        user.full_name = req.personal_details.get("full_name")
        await user.save()

    await log_hr_action(admin_user, "APPROVE", str(req.id), {"status": "SUBMITTED"}, {"status": "APPROVED", "emp_code": emp_code})
    
    return req

async def log_hr_action(user: User, action: str, resource_id: str, old_val: Any, new_val: Any):
    log = AuditLog(
        user_id=str(user.id),
        user_email=user.email,
        role=user.role.value if user.role else "unknown",
        department=user.department.value if user.department else None,
        module="onboarding",
        action=action,
        resource_id=resource_id,
        old_value=old_val if isinstance(old_val, dict) else {"val": old_val},
        new_value=new_val if isinstance(new_val, dict) else {"val": new_val}
    )
    await log.insert()
