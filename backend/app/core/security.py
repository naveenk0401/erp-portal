from datetime import datetime, timedelta
from typing import Any
from jose import jwt
import bcrypt
from ..core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_token(subject: Any, expires_delta: timedelta, is_refresh: bool = False, extra_claims: dict[str, Any] = None) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject), "refresh": is_refresh}
    if extra_claims:
        to_encode.update(extra_claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_access_token(subject: Any, extra_claims: dict[str, Any] = None) -> str:
    return create_token(
        subject, 
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims=extra_claims
    )

def create_refresh_token(subject: Any) -> str:
    return create_token(
        subject, 
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), 
        is_refresh=True
    )
