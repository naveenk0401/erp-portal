import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.strategy import OKR
from app.core.config import settings

async def migrate_okrs():
    print("🚀 Starting OKR Level Migration...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[OKR])
    
    # Update all OKRs that don't have a level field
    result = await OKR.find({"level": {"$exists": False}}).update({"$set": {"level": "company"}})
    print(f"✅ Migration complete. Updated OKRs: {result}")
    
    # Also check total counts
    total = await OKR.count()
    company = await OKR.find({"level": "company"}).count()
    dept = await OKR.find({"level": "department"}).count()
    
    print(f"📊 Stats - Total: {total}, Company: {company}, Dept: {dept}")

if __name__ == "__main__":
    asyncio.run(migrate_okrs())
