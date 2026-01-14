from beanie import Document, Indexed
from pydantic import Field
from typing import Optional

class Permission(Document):
    """
    Master list of system permissions.
    Follows module.action format (e.g., 'inventory.create').
    """
    key: Indexed(str, unique=True) = Field(..., description="Unique permission identifier (e.g., 'inventory.create')")
    module: str = Field(..., description="The module this permission belongs to (e.g., 'inventory')")
    action: str = Field(..., description="The action permitted (e.g., 'create')")
    description: Optional[str] = Field(None, description="Human readable description of the permission")

    class Settings:
        name = "permissions"
