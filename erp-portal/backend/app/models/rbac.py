from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed, Link
from pydantic import EmailStr, Field
from enum import Enum

class Scope(str, Enum):
    ALL = "ALL"
    DEPARTMENT = "DEPARTMENT"
    SELF = "SELF"

class RoleEnum(str, Enum):
    # Standard Hierarchical Roles
    SUPER_ADMIN = "super_admin"
    DEPARTMENT_HEAD = "department_head"
    DEPARTMENT_MANAGER = "department_manager"
    TEAM_LEAD = "team_lead"
    EMPLOYEE = "employee"
    
    # Legacy / Specialized Roles (for compatibility)
    ADMIN = "admin"
    HR = "hr"
    ACCOUNTANT = "accountant"
    FINANCE = "finance"
    DEPT_ADMIN = "dept_admin"
    MANAGER = "manager"

class Department(Document):
    name: Indexed(str, unique=True)
    code: Indexed(str, unique=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "departments"

class Permission(Document):
    code: Indexed(str, unique=True) # e.g. salary.view
    description: Optional[str] = None

    class Settings:
        name = "permissions"

class Role(Document):
    name: Indexed(str, unique=True)
    permissions: List[Link[Permission]] = []
    default_scope: Scope = Scope.SELF

    class Settings:
        name = "roles"
