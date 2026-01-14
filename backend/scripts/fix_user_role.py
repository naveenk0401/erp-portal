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

    if not user.active_company_id:
        print("User has no active company")
        return

    admin_role = await Role.find_one(
        Role.company_id == user.active_company_id,
        Role.name == "Administrator"
    )

    if not admin_role:
        print("Administrator role not found in active company")
        return

    if admin_role.id not in user.role_ids:
        user.role_ids.append(admin_role.id)
        await user.save()
        print(f"Successfully assigned Administrator role ({admin_role.id}) to {user.email}")
    else:
        print("User already has the Administrator role")

if __name__ == "__main__":
    asyncio.run(main())
