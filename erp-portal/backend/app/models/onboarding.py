from datetime import datetime
from typing import Optional, Dict, Any
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class Onboarding(Document):
    user: Link[User]
    basic: Dict[str, Any] = {}
    job: Dict[str, Any] = {}
    contact: Dict[str, Any] = {}
    bank: Dict[str, Any] = {}
    docs: Dict[str, Any] = {}
    status: str = "Draft" # Draft, Submitted, Approved, Rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "onboarding"
