from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class PermissionRead(BaseModel):
    id: str = Field(..., alias="_id")
    key: str
    module: str
    action: str
    description: Optional[str]

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

class PermissionModuleGroup(BaseModel):
    module: str
    permissions: List[PermissionRead]
