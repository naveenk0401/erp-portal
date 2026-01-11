from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class Leave(Document):
    user: Link[User]
    type: str # Annual, Sick, Casual, etc.
    start_date: datetime
    end_date: datetime
    days: int
    reason: str
    status: str = "pending" # pending, approved, rejected
    approved_by: Optional[Link[User]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "leaves"

class IDCard(Document):
    user: Link[User]
    card_number: Indexed(str, unique=True)
    issue_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    qr_code_data: Optional[str] = None
    status: str = "active" # active, suspended, expired
    
    class Settings:
        name = "id_cards"
