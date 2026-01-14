from pydantic import BaseModel, EmailStr, Field
from beanie import PydanticObjectId


class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

from typing import Optional

class TokenData(BaseModel):
    email: Optional[str] = None

class UserOut(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    email: EmailStr
    status: str

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
