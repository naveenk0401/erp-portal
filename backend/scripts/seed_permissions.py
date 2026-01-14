import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.permission import Permission
from app.models.user import User
from app.models.company import Company
from app.models.file import FileMetadata

INITIAL_PERMISSIONS = [
    {"key": "users.view", "module": "users", "action": "view", "description": "View user list and details"},
    {"key": "users.create", "module": "users", "action": "create", "description": "Create new users"},
    {"key": "users.edit", "module": "users", "action": "edit", "description": "Edit existing users"},
    {"key": "companies.view", "module": "companies", "action": "view", "description": "View company details"},
    {"key": "companies.edit", "module": "companies", "action": "edit", "description": "Edit company settings"},
    {"key": "inventory.view", "module": "inventory", "action": "view", "description": "View inventory items"},
    {"key": "inventory.manage", "module": "inventory", "action": "manage", "description": "Add, edit, or delete inventory"},
    {"key": "finance.view", "module": "finance", "action": "view", "description": "View financial reports"},
    {"key": "finance.approve", "module": "finance", "action": "approve", "description": "Approve financial transactions"},
    {"key": "roles.view", "module": "roles", "action": "view", "description": "View company roles"},
    {"key": "roles.manage", "module": "roles", "action": "manage", "description": "Create, edit, or delete company roles"},
    # Sales Module Permissions
    {"key": "sales.quote.view", "module": "sales", "action": "view_quote", "description": "View quotations"},
    {"key": "sales.quote.create", "module": "sales", "action": "create_quote", "description": "Create quotations"},
    {"key": "sales.order.view", "module": "sales", "action": "view_order", "description": "View sales orders"},
    {"key": "sales.order.create", "module": "sales", "action": "create_order", "description": "Create sales orders"},
    {"key": "sales.invoice.view", "module": "sales", "action": "view_invoice", "description": "View invoices"},
    {"key": "sales.invoice.issue", "module": "sales", "action": "issue_invoice", "description": "Issue invoices"},
    {"key": "sales.credit_note.create", "module": "sales", "action": "create_credit_note", "description": "Create credit notes"},
]

async def seed_permissions():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[User, Company, FileMetadata, Permission]
    )

    print("Seeding permissions...")
    for perm_data in INITIAL_PERMISSIONS:
        existing = await Permission.find_one(Permission.key == perm_data["key"])
        if not existing:
            perm = Permission(**perm_data)
            await perm.insert()
            print(f"Added permission: {perm_data['key']}")
        else:
            print(f"Permission already exists: {perm_data['key']}")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_permissions())
