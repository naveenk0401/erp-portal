import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document, PydanticObjectId
from app.core.config import settings
from typing import List, Optional

class User(Document):
    email: str
    active_company_id: Optional[PydanticObjectId]
    role_ids: List[PydanticObjectId] = []
    class Settings:
        name = "users"

class Role(Document):
    name: str
    permission_keys: List[str]
    company_id: PydanticObjectId
    class Settings:
        name = "roles"

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[User, Role])
    
    user = await User.find_one(User.email == "Naveen@gmail.com")
    if not user:
        print("User not found")
        return

    print(f"User: {user.email}")
    print(f"Active Company ID: {user.active_company_id}")
    print(f"Role IDs: {user.role_ids}")

    # Check roles for active company
    if user.active_company_id:
        roles = await Role.find(
            Role.company_id == user.active_company_id
        ).to_list()
        
        print(f"\nRoles available in company {user.active_company_id}:")
        for r in roles:
            is_assigned = r.id in user.role_ids
            print(f" - {r.name} (ID: {r.id}) {'[ASSIGNED]' if is_assigned else '[NOT ASSIGNED]'}")
            if is_assigned:
                has_manage = "roles.manage" in r.permission_keys
                print(f"   -> has roles.manage: {has_manage}")
    else:
        print("No active company set for user")

if __name__ == "__main__":
    asyncio.run(main())
