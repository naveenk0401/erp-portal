import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.company import Company
from app.models.file import FileMetadata

SYSTEM_ROLES = [
    {
        "name": "Administrator",
        "description": "Full access to all modules and settings",
        "permission_keys": [
            "users.view", "users.create", "users.edit",
            "companies.view", "companies.edit",
            "inventory.view", "inventory.manage",
            "finance.view", "finance.approve"
        ],
        "is_system": True
    },
    {
        "name": "Staff",
        "description": "Standard access to view data and manage inventory",
        "permission_keys": [
            "users.view",
            "companies.view",
            "inventory.view", "inventory.manage",
            "finance.view"
        ],
        "is_system": True
    }
]

async def seed_roles():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Only initialize the models needed for seeding to avoid index conflicts in other models
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[Company, Role]
    )

    # We need at least one company to seed these roles into, 
    # or we can treat system roles as templates that get copied to every new company.
    # For now, let's seed them into ALL existing companies.
    
    companies = await Company.find_all().to_list()
    if not companies:
        print("No companies found. Roles will be created when the first company is registered.")
        return

    print(f"Seeding roles for {len(companies)} companies...")
    for company in companies:
        for role_data in SYSTEM_ROLES:
            existing = await Role.find_one(Role.company_id == company.id, Role.name == role_data["name"])
            if not existing:
                role = Role(**role_data, company_id=company.id)
                await role.insert()
                print(f"Added role '{role_data['name']}' to company: {company.id}")
            else:
                print(f"Role '{role_data['name']}' already exists in company: {company.id}")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_roles())
