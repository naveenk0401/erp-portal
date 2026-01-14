import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document
from app.core.config import settings

class User(Document):
    email: str
    active_company_id: object = None
    class Settings:
        name = "users"

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[User])
    users = await User.find_all().to_list()
    for u in users:
        print(f"Email: {u.email}, Active Company: {u.active_company_id}")

if __name__ == "__main__":
    asyncio.run(main())
