from beanie import PydanticObjectId
from ..models.role import Role
from ..models.user import User
from ..models.permission import Permission

async def init_company_roles(company_id: PydanticObjectId):
    """
    Creates standard system roles for a new company.
    """
    # Fetch all permissions to give to Administrator
    all_permissions = await Permission.find_all().to_list()
    all_keys = [p.key for p in all_permissions]

    staff_keys = [
        "users.view",
        "companies.view",
        "inventory.view", "inventory.manage",
        "finance.view"
    ]

    system_roles = [
        {
            "name": "Administrator",
            "description": "Full access to all modules and settings",
            "permission_keys": all_keys,
            "is_system": True,
            "company_id": company_id
        },
        {
            "name": "Staff",
            "description": "Standard access to view data and manage inventory",
            "permission_keys": staff_keys,
            "is_system": True,
            "company_id": company_id
        }
    ]

    for role_data in system_roles:
        existing = await Role.find_one(
            Role.company_id == company_id, 
            Role.name == role_data["name"]
        )
        if not existing:
            role = Role(**role_data)
            await role.insert()

async def assign_admin_role(user: User, company_id: PydanticObjectId):
    """
    Assigns the Administrator role of a company to a user.
    """
    admin_role = await Role.find_one(
        Role.company_id == company_id, 
        Role.name == "Administrator"
    )
    
    if admin_role:
        if user.role_ids is None:
            user.role_ids = []
            
        if admin_role.id not in user.role_ids:
            user.role_ids.append(admin_role.id)
            await user.save()
