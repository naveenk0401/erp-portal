import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User

async def reconcile_admin_roles():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[User, Role, Permission]
    )

    print("Fetching all permission keys...")
    all_permissions = await Permission.find_all().to_list()
    all_keys = [p.key for p in all_permissions]
    print(f"Total permissions found: {len(all_keys)}")

    print("Updating 'Administrator' roles...")
    admin_roles = await Role.find(Role.name == "Administrator").to_list()
    for role in admin_roles:
        missing = set(all_keys) - set(role.permission_keys)
        if missing:
            role.permission_keys = list(set(role.permission_keys) | set(all_keys))
            await role.save()
            print(f"Updated role {role.id} for company {role.company_id}. Added {len(missing)} permissions.")
        else:
            print(f"Role {role.id} already has all permissions.")

    print("Reconciliation complete!")

if __name__ == "__main__":
    asyncio.run(reconcile_admin_roles())
