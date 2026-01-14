from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class OKR(Document):
    title: str
    description: Optional[str] = None
    target_value: float
    current_value: float = 0.0
    unit: str # %, $, count, etc.
    status: str = "on_track" # on_track, at_risk, behind
    owner: Link[User]
    key_results: List[Dict[str, Any]] = [] # {text, progress}
    level: str = "company" # company, department
    department: Optional[str] = None # e.g. "software", "sales"
    deadline: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "okrs"

class PerformanceReview(Document):
    user: Link[User]
    reviewer: Link[User]
    period: str # Q1 2024, etc.
    score: float
    feedback: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "performance_reviews"
