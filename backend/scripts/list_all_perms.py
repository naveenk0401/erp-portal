import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document
from app.core.config import settings

class Permission(Document):
    key: str
    class Settings:
        name = "permissions"

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[Permission])
    perms = await Permission.find_all().to_list()
    print(f"Total System Permissions: {len(perms)}")
    for p in sorted([p.key for p in perms]):
        print(f" - {p}")

if __name__ == "__main__":
    asyncio.run(main())
