from datetime import datetime
from typing import Optional, List
from enum import Enum
from beanie import Document, Link
from pydantic import Field
from app.models.user import User

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REVIEW = "review"

class Task(Document):
    title: str
    description: str
    assigned_to: Link[User]
    created_by: Link[User]
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
