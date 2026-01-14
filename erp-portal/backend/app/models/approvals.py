from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class ApprovalRequest(Document):
    requester: Link[User]
    module: str # leave, expense, onboarding, etc.
    resource_id: str # ID of the record being approved
    data_snapshot: Dict[str, Any] # Snapshot of data at request time
    status: str = "pending" # pending, approved, rejected, cancelled
    approvers: List[Link[User]] = []
    current_approver: Optional[Link[User]] = None
    comments: List[Dict[str, Any]] = [] # {user_id, comment, timestamp}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "approvals"
