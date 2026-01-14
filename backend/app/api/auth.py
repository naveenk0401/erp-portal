from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from ..core.config import settings
from ..core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, Token, TokenData
from .deps import get_current_user, get_my_permissions

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )
    
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password)
    )
    await new_user.insert()
    
    extra_claims = {
        "user_id": str(new_user.id),
        "active_company_id": str(new_user.active_company_id) if new_user.active_company_id else None
    }
    
    return {
        "access_token": create_access_token(new_user.email, extra_claims=extra_claims),
        "refresh_token": create_refresh_token(new_user.email),
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    user = await User.find_one(User.email == user_in.email)
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    extra_claims = {
        "user_id": str(user.id),
        "active_company_id": str(user.active_company_id) if user.active_company_id else None
    }
    
    return {
        "access_token": create_access_token(user.email, extra_claims=extra_claims),
        "refresh_token": create_refresh_token(user.email),
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        is_refresh: bool = payload.get("refresh")
        if email is None or not is_refresh:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    extra_claims = {
        "user_id": str(user.id),
        "active_company_id": str(user.active_company_id) if user.active_company_id else None
    }
    
    return {
        "access_token": create_access_token(user.email, extra_claims=extra_claims),
        "refresh_token": create_refresh_token(user.email),
        "token_type": "bearer"
    }


@router.get("/permissions")
async def get_current_permissions(permissions: set[str] = Depends(get_my_permissions)):
    return list(permissions)

@router.post("/logout")
async def logout():
    # In a simple JWT setup, logout is usually handled on the client side by discarding the token.
    # For a more secure setup, you could blacklist tokens in Redis.
    return {"detail": "Successfully logged out"}
