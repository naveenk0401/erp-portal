from typing import Optional, List
from beanie import Document, Indexed, Link
from pydantic import EmailStr, Field
from enum import Enum

class Scope(str, Enum):
    ALL = "ALL"
    DEPARTMENT = "DEPARTMENT"
    SELF = "SELF"

class RoleEnum(str, Enum):
    SUPER_ADMIN = "super_admin"
    DEPT_ADMIN = "dept_admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class Department(str, Enum):
    ACCOUNTANT = "accountant"
    HR = "hr"
    SOFTWARE = "software"
    SALES = "sales"
    ADMIN = "admin"

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
