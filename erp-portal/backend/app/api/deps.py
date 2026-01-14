from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user as auth_get_user
from app.models.user import User

async def get_current_user(user: User = Depends(auth_get_user)) -> User:
    return user

# Legacy role checker
def check_role(roles: list):
    async def role_checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires one of the following roles: {roles}"
            )
        return user
    return role_checker
