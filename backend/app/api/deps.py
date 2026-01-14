from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from ..core.config import settings
from ..models.user import User
from ..models.role import Role
from ..services.cache import permission_cache
from beanie import PydanticObjectId
from beanie.operators import In

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await User.find_one(User.email == email)
    if user is None:
        raise credentials_exception
    return user

async def get_my_permissions(request: Request) -> set[str]:
    user_id = getattr(request.state, "user_id", None)
    active_company_id = getattr(request.state, "active_company_id", None)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )

    if not active_company_id:
        return set()

    # 1. Try fetching from cache
    user_permissions = permission_cache.get_permissions(user_id, active_company_id)

    if user_permissions is None:
        # 2. Cache miss - fetch from MongoDB
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            return set()

        roles = await Role.find(
            In(Role.id, user.role_ids),
            Role.company_id == PydanticObjectId(active_company_id)
        ).to_list()

        user_permissions = set()
        for role in roles:
            user_permissions.update(role.permission_keys)
        
        # 3. Populate cache
        permission_cache.set_permissions(user_id, active_company_id, user_permissions)
    
    return user_permissions

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    async def __call__(self, request: Request):
        user_permissions = await get_my_permissions(request)

        # Check required permission
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {self.required_permission}"
            )

        return True
