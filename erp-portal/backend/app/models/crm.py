from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from beanie import Document, Link, Indexed
from pydantic import Field
from app.models.user import User

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    WON = "won"
    LOST = "lost"

class DealStage(str, Enum):
    PROSPECTING = "prospecting"
    VALUE_PROPOSITION = "value_proposition"
    DECISION_MAKERS = "decision_makers"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class ActivityType(str, Enum):
    CALL = "call"
    MEETING = "meeting"
    EMAIL = "email"
    FOLLOW_UP = "follow_up"

class Lead(Document):
    name: str
    email: Indexed(str)
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "direct"
    status: LeadStatus = LeadStatus.NEW
    assigned_to: Optional[Link[User]] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "crm_leads"

class Deal(Document):
    title: str
    amount: float
    probability: int = 10 # 0-100
    stage: DealStage = DealStage.PROSPECTING
    lead: Link[Lead]
    owner: Link[User]
    expected_close_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "crm_deals"

class Activity(Document):
    type: ActivityType
    content: str
    lead: Optional[Link[Lead]] = None
    deal: Optional[Link[Deal]] = None
    performed_by: Link[User]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "crm_activities"

class Customer(Document):
    lead: Link[Lead]
    user_account: Optional[Link[User]] = None # If they have a portal login
    customer_since: datetime = Field(default_factory=datetime.utcnow)
    lifetime_value: float = 0.0
    status: str = "active"

    class Settings:
        name = "crm_customers"
