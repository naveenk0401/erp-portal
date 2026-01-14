from fastapi import APIRouter, HTTPException, Depends
from typing import List
from beanie import PydanticObjectId
from beanie.operators import In
from ..models.role import Role
from ..schemas.role import RoleCreate, RoleUpdate, RoleRead, UserRoleAssignment
from ..models.user import User
from ..services.cache import permission_cache
# Assuming an auth dependency exists or will be used. 
# For now, we will require company_id to be passed or inferred.

router = APIRouter()

@router.post("/", response_model=RoleRead)
async def create_role(role_in: RoleCreate, company_id: PydanticObjectId):
    """
    Create a new custom role for a company.
    """
    # Check if a role with the same name already exists in the company
    existing = await Role.find_one(Role.company_id == company_id, Role.name == role_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists in this company")
    
    role = Role(
        **role_in.dict(),
        company_id=company_id,
        is_system=False
    )
    await role.insert()
    return role

@router.get("/", response_model=List[RoleRead])
async def list_roles(company_id: PydanticObjectId):
    """
    List all roles for a company.
    """
    return await Role.find(Role.company_id == company_id).to_list()

@router.get("/{role_id}", response_model=RoleRead)
async def get_role(role_id: PydanticObjectId, company_id: PydanticObjectId):
    """
    Get a specific role.
    """
    role = await Role.find_one(Role.id == role_id, Role.company_id == company_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.patch("/{role_id}", response_model=RoleRead)
async def update_role(role_id: PydanticObjectId, role_in: RoleUpdate, company_id: PydanticObjectId):
    """
    Update a custom role. System roles cannot be updated.
    """
    role = await Role.find_one(Role.id == role_id, Role.company_id == company_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.is_system:
        raise HTTPException(status_code=403, detail="System protected roles cannot be modified")
    
    update_data = role_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(role, key, value)
    
    await role.save()
    
    # Invalidate all users in this company since a role changed
    permission_cache.invalidate_all_for_company(str(company_id))
    
    return role

@router.delete("/{role_id}")
async def delete_role(role_id: PydanticObjectId, company_id: PydanticObjectId):
    """
    Delete a custom role. System roles cannot be deleted.
    """
    role = await Role.find_one(Role.id == role_id, Role.company_id == company_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role.is_system:
        raise HTTPException(status_code=403, detail="System protected roles cannot be deleted")
    
    await role.delete()
    return {"message": "Role deleted successfully"}

@router.post("/assign", response_model=dict)
async def assign_role(assignment: UserRoleAssignment, company_id: PydanticObjectId):
    """
    Assign a role to a user within a company.
    """
    # 1. Verify role exists and belongs to company
    role = await Role.find_one(Role.id == assignment.role_id, Role.company_id == company_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found in this company")
    
    # 2. Verify user belongs to company
    user = await User.find_one(User.id == assignment.user_id, User.company_ids == company_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found in this company")
    
    # 3. Add role if not already assigned
    if assignment.role_id not in user.role_ids:
        user.role_ids.append(assignment.role_id)
        await user.save()
        
        # Invalidate cache for this user in this company
        permission_cache.invalidate(str(assignment.user_id), str(company_id))
        
        return {"message": f"Role '{role.name}' assigned to user"}
    
    return {"message": "Role already assigned to user"}

@router.post("/revoke", response_model=dict)
async def revoke_role(assignment: UserRoleAssignment, company_id: PydanticObjectId):
    """
    Revoke a role from a user within a company.
    """
    # 1. Verify Role exists in company
    role = await Role.find_one(Role.id == assignment.role_id, Role.company_id == company_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found in this company")

    user = await User.find_one(User.id == assignment.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if assignment.role_id in user.role_ids:
        user.role_ids.remove(assignment.role_id)
        await user.save()
        
        # Invalidate cache for this user in this company
        permission_cache.invalidate(str(assignment.user_id), str(company_id))
        
        return {"message": f"Role '{role.name}' revoked from user"}
    
    return {"message": "User did not have this role"}

@router.get("/user/{user_id}", response_model=list[RoleRead])
async def list_user_roles(user_id: str, company_id: str):
    """
    List all roles a user has within a specific company.
    """
    try:
        # Convert strings to PydanticObjectId for the query
        uid = PydanticObjectId(user_id)
        cid = PydanticObjectId(company_id)
        
        user = await User.find_one(User.id == uid, User.company_ids == cid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found in this company")
        
        # Filter user's roles to only include those belonging to this company
        if not user.role_ids:
            return []
            
        roles = await Role.find(
            In(Role.id, user.role_ids),
            Role.company_id == cid
        ).to_list()
        return roles
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"ERROR IN list_user_roles: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    return roles
