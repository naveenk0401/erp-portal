import asyncio
from app.db import init_db
from app.models.user import User
from app.models.rbac import RoleEnum
from app.core.security import get_password_hash

async def create_super_admin():
    """Create a super admin user if it doesn't exist"""
    await init_db()
    
    # Check if super admin exists
    admin = await User.find_one(User.email == "admin@erp.com")
    
    if admin:
        print(f"Super admin already exists: {admin.email}")
        return
    
    # Create new super admin
    hashed_password = get_password_hash("admin123")
    
    admin_user = User(
        supabase_id="admin-001",
        email="admin@erp.com",
        full_name="Super Admin",
        hashed_password=hashed_password,
        role=RoleEnum.SUPER_ADMIN,
        is_active=True,
        status="active"
    )
    
    await admin_user.insert()
    print(f"Super admin created successfully!")
    print(f"Email: admin@erp.com")
    print(f"Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_super_admin())
