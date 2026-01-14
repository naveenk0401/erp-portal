from pydantic import BaseModel, Field
from typing import List, Optional
from beanie import PydanticObjectId

class RoleBase(BaseModel):
    name: str
    description: str = ""
    permission_keys: List[str] = []

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_keys: Optional[List[str]] = None

class RoleRead(RoleBase):
    id: PydanticObjectId = Field(..., alias="_id")
    company_id: PydanticObjectId
    is_system: bool

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class UserRoleAssignment(BaseModel):
    user_id: PydanticObjectId
    role_id: PydanticObjectId
