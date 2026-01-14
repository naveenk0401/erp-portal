from typing import Optional
from contextvars import ContextVar
from beanie import PydanticObjectId

# ContextVar to store the current tenant (company) ID for the request
_tenant_id: ContextVar[Optional[PydanticObjectId]] = ContextVar("tenant_id", default=None)

def set_tenant_id(tenant_id: Optional[PydanticObjectId]) -> None:
    """Set the current tenant ID in the request context."""
    _tenant_id.set(tenant_id)

def get_tenant_id() -> Optional[PydanticObjectId]:
    """Get the current tenant ID from the request context."""
    return _tenant_id.get()
