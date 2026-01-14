import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.permission import Permission
from app.models.user import User
from app.models.company import Company
from app.models.role import Role
from app.models.file import FileMetadata
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.item import Item
from app.models.category import ItemCategory
from app.models.tax import Tax
from app.models.price_list import PriceList

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "erp_portal")

permissions_to_seed = [
    # Customer Permissions
    {"key": "customers.view", "module": "customers", "action": "view", "description": "View customers"},
    {"key": "customers.create", "module": "customers", "action": "create", "description": "Create new customers"},
    {"key": "customers.edit", "module": "customers", "action": "edit", "description": "Edit customer details"},
    {"key": "customers.delete", "module": "customers", "action": "delete", "description": "Deactivate/Delete customers"},
    
    # Vendor Permissions
    {"key": "vendors.view", "module": "vendors", "action": "view", "description": "View vendors"},
    {"key": "vendors.create", "module": "vendors", "action": "create", "description": "Create new vendors"},
    {"key": "vendors.edit", "module": "vendors", "action": "edit", "description": "Edit vendor details"},
    {"key": "vendors.delete", "module": "vendors", "action": "delete", "description": "Deactivate/Delete vendors"},
    
    # Item Permissions
    {"key": "items.view", "module": "items", "action": "view", "description": "View items"},
    {"key": "items.create", "module": "items", "action": "create", "description": "Create new items"},
    {"key": "items.edit", "module": "items", "action": "edit", "description": "Edit item details"},
    {"key": "items.delete", "module": "items", "action": "delete", "description": "Deactivate/Delete items"},

    # Category Permissions
    {"key": "categories.view", "module": "categories", "action": "view", "description": "View categories"},
    {"key": "categories.create", "module": "categories", "action": "create", "description": "Create new categories"},
    {"key": "categories.edit", "module": "categories", "action": "edit", "description": "Edit categories"},
    {"key": "categories.delete", "module": "categories", "action": "delete", "description": "Delete categories"},

    # Tax Permissions
    {"key": "taxes.view", "module": "taxes", "action": "view", "description": "View taxes"},
    {"key": "taxes.create", "module": "taxes", "action": "create", "description": "Create new taxes"},
    {"key": "taxes.edit", "module": "taxes", "action": "edit", "description": "Edit taxes"},
    {"key": "taxes.delete", "module": "taxes", "action": "delete", "description": "Delete taxes"},

    # Price List Permissions
    {"key": "price_lists.view", "module": "price_lists", "action": "view", "description": "View price lists"},
    {"key": "price_lists.create", "module": "price_lists", "action": "create", "description": "Create new price lists"},
    {"key": "price_lists.edit", "module": "price_lists", "action": "edit", "description": "Edit price lists"},
    {"key": "price_lists.delete", "module": "price_lists", "action": "delete", "description": "Delete price lists"},
]

async def seed_permissions():
    if not MONGODB_URL:
        print("MONGODB_URL not found in environment.")
        return

    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[
            User, Company, FileMetadata, Permission, Role,
            Customer, Vendor, Item, ItemCategory, Tax, PriceList
        ]
    )

    print("Seeding permissions...")
    for p_data in permissions_to_seed:
        existing = await Permission.find_one(Permission.key == p_data["key"])
        if not existing:
            permission = Permission(**p_data)
            await permission.insert()
            print(f"Added permission: {p_data['key']}")
        else:
            print(f"Permission already exists: {p_data['key']}")
    
    print("Permission seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_permissions())
