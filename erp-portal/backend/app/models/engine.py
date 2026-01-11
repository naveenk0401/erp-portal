from typing import Optional, Any, Dict
from beanie import Document, Indexed, Link
from pydantic import Field
from datetime import datetime
from app.models.user import User

class AuditLog(Document):
    user_id: str
    user_email: str
    role: str
    department: Optional[str] = None
    company_id: Optional[str] = None
    module: str # employee, payroll, task, rule
    action: str # CREATE, UPDATE, DELETE, APPROVE
    resource_id: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None

    class Settings:
        name = "audit_logs"

class Rule(Document):
    name: Indexed(str, unique=True)
    rule_type: str # attendance, payroll, project
    condition: Dict[str, Any] # JSON condition
    threshold: float
    action: str # e.g. "LOG", "ALERT", "LOP"
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    is_active: bool = True

    class Settings:
        name = "rules"

class RuleLog(Document):
    rule: Link[Rule]
    executed_at: datetime = Field(default_factory=datetime.utcnow)
    target_user: Optional[Link[User]] = None
    result: Dict[str, Any]
    action_taken: bool = False

    class Settings:
        name = "rule_logs"
