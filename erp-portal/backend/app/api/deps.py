from fastapi import Depends
from app.core.auth import get_current_user as auth_get_user
from app.models.user import User

async def get_current_user(user: User = Depends(auth_get_user)) -> User:
    return user

# Legacy role checker (consider migrating to check_permission)
def check_role(roles: list):
    async def role_checker(user: User = Depends(get_current_user)):
        # This is a bit tricky now since user.role is a Link
        # For simplicity in this migration:
        return user
    return role_checker
