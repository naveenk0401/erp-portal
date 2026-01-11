from datetime import datetime
from typing import Optional
from pydantic import Field
from beanie import Document, Link
from app.models.user import User

class Attendance(Document):
    user: Link[User]
    date: datetime = Field(default_factory=datetime.utcnow)
    check_in: datetime
    check_out: Optional[datetime] = None
    status: str = "present" # present, absent, late, half-day

    class Settings:
        name = "attendance"
