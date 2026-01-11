from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class Project(Document):
    name: str
    description: Optional[str] = None
    status: str = "active" # active, completed, on_hold
    members: List[Link[User]] = []
    manager: Link[User]
    deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "projects"

class Sprint(Document):
    project: Link[Project]
    name: str
    goal: Optional[str] = None
    start_date: datetime
    end_date: datetime
    status: str = "planned" # planned, active, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "sprints"

class Asset(Document):
    name: str
    type: str # Laptop, Phone, Software License, etc.
    serial_number: Optional[str] = None
    assigned_to: Optional[Link[User]] = None
    status: str = "available" # available, assigned, maintenance, lost
    purchase_date: Optional[datetime] = None
    value: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "assets"
