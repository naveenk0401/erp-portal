from typing import List
from pydantic import Field
from .base import TenantDocument

class Role(TenantDocument):
    """
    User roles within a company.
    Includes a list of permission keys and a system protection flag.
    """
    name: str = Field(..., description="Name of the role (e.g., 'Inventory Manager')")
    description: str = Field("", description="Human readable description of the role")
    permission_keys: List[str] = Field(default_factory=list, description="List of module.action permission keys")
    is_system: bool = Field(False, description="Whether this is a protected system role")

    class Settings:
        name = "roles"
