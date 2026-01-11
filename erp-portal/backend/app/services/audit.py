from typing import Any, Dict, Optional
from app.models.engine import AuditLog
from app.models.user import User

async def log_action(
    user: User,
    module: str,
    action: str,
    resource_id: str,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    log = AuditLog(
        user_id=str(user.id),
        user_email=user.email,
        role=user.role.name if user.role else "UNKNOWN",
        department=user.department.name if user.department else None,
        company_id=str(user.company.id) if user.company else None,
        module=module,
        action=action,
        resource_id=resource_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address
    )
    await log.insert()
