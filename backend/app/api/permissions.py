from fastapi import APIRouter, HTTPException
from typing import List, Dict
from ..models.permission import Permission
from ..schemas.permission import PermissionRead, PermissionModuleGroup
from collections import defaultdict

router = APIRouter()

@router.get("/", response_model=List[PermissionRead])
async def list_permissions():
    """
    Fetch all available permissions in the system.
    """
    return await Permission.find_all().to_list()

@router.get("/modules", response_model=List[PermissionModuleGroup])
async def list_permissions_by_module():
    """
    Fetch permissions grouped by module for UI convenience.
    """
    permissions = await Permission.find_all().to_list()
    
    grouped = defaultdict(list)
    for p in permissions:
        # Convert to dict with JSON-compatible types so Pydantic can validate correctly
        grouped[p.module].append(p.model_dump(mode='json'))
    
    return [
        PermissionModuleGroup(module=module, permissions=perms)
        for module, perms in grouped.items()
    ]
