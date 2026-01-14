import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User
from app.models.company import Company
from app.models.file import FileMetadata

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = "erp_portal"

async def init_db():
    if not MONGODB_URL:
        print("MONGODB_URL not found in environment.")
        return

    print(f"Connecting to MongoDB and initializing models...")
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        await init_beanie(
            database=client[DATABASE_NAME],
            document_models=[User, Company, FileMetadata]
        )
        print("Models initialized successfully.")
        
        # Verify collections exist
        db = client[DATABASE_NAME]
        collections = await db.list_collection_names()
        print(f"Current collections in database: {collections}")
        
    except Exception as e:
        print(f"Error initializing models: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
