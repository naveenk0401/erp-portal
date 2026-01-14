from datetime import datetime
from typing import Optional, List
from enum import Enum
from beanie import Document, Link
from pydantic import Field
from app.models.user import User
from app.models.rbac import Department

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REVIEW = "review"

class Task(Document):
    title: str
    description: str
    department: Optional[Link[Department]] = None
    assigned_to: Link[User]
    created_by: Link[User]
    assigned_role_level: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: str = "medium" # low, medium, high
    due_date: Optional[datetime] = None
    audit_trail: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
