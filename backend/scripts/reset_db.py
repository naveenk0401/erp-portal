import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = "erp_portal" # Default from config.py
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "erp-files")

async def reset_mongodb():
    if not MONGODB_URL:
        print("MONGODB_URL not found in environment. Skipping MongoDB reset.")
        return

    print(f"Connecting to MongoDB at {MONGODB_URL.split('@')[-1]}...")
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        collections = await db.list_collection_names()
        print(f"Found collections: {collections}")
        
        for collection in collections:
            print(f"Dropping collection: {collection}")
            await db.drop_collection(collection)
        
        print("MongoDB reset complete.")
    except Exception as e:
        print(f"Error resetting MongoDB: {e}")

def reset_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials not found. Skipping Supabase reset.")
        return

    try:
        from supabase import create_client, Client
    except Exception as e:
        print(f"Could not import supabase client (likely Python 3.14 incompatibility): {e}")
        print("Skipping Supabase reset.")
        return

    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print(f"Listing files in bucket: {SUPABASE_BUCKET}...")
        files = supabase.storage.from_(SUPABASE_BUCKET).list()
        
        if not files:
            print("No files found in bucket.")
            return

        file_paths = []
        for file in files:
            if file.get('name') == '.emptyFolderPlaceholder':
                continue
            file_paths.append(file.get('name'))
        
        if file_paths:
            print(f"Deleting files: {file_paths}")
            supabase.storage.from_(SUPABASE_BUCKET).remove(file_paths)
            print("Supabase storage reset complete.")
        else:
            print("No files to delete.")
            
    except Exception as e:
        print(f"Error resetting Supabase: {e}")

async def main():
    print("Starting database and storage reset...")
    await reset_mongodb()
    reset_supabase()
    print("Reset process finished successfully.")

if __name__ == "__main__":
    asyncio.run(main())
