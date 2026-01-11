import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.strategy import OKR
from app.core.config import settings

async def check_db():
    print("🔍 Checking Database Status...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[User, OKR])
    
    users_count = await User.count()
    admin_user = await User.find_one(User.role == "admin")
    okrs_count = await OKR.count()
    
    print(f"Total Users: {users_count}")
    print(f"Admin User Found: {admin_user.email if admin_user else 'None'}")
    print(f"Total OKRs: {okrs_count}")

if __name__ == "__main__":
    asyncio.run(check_db())
