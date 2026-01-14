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
    company_id: object
    class Settings:
        name = "roles"

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[Role])
    roles = await Role.find_all().to_list()
    for r in roles:
        print(f"Role: {r.name} (ID: {r.id}), Permissions Count: {len(r.permission_keys)}")
        if "roles.manage" in r.permission_keys:
            print("  - [X] has roles.manage")
        else:
            print("  - [ ] MISSING roles.manage")

if __name__ == "__main__":
    asyncio.run(main())
