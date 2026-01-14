import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document
from app.core.config import settings
from typing import List

class Role(Document):
    name: str
    permission_keys: List[str]
    class Settings:
        name = "roles"

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[Role])
    role = await Role.find_one(Role.name == "Administrator")
    if role:
        print(f"Administrator Permissions ({len(role.permission_keys)}):")
        for k in sorted(role.permission_keys):
            print(f" - {k}")
    else:
        print("Administrator role not found")

if __name__ == "__main__":
    asyncio.run(main())
