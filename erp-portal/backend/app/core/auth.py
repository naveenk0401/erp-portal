from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from app.models.user import User

security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token.credentials, 
            settings.JWT_SECRET, 
            algorithms=[settings.ALGORITHM]
        )
        supabase_id: str = payload.get("sub")
        if supabase_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await User.find_one(User.supabase_id == supabase_id)
    if user is None:
        # Optionally create user profile if it doesn't exist yet (lazy sync)
        # For now, we assume users are synced via a signup hook or first login
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in ERP system"
        )
    return user
