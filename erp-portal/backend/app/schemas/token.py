from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    redirect_url: Optional[str] = "/dashboard"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
