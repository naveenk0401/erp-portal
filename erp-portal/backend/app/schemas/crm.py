from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.crm import LeadStatus, DealStage, ActivityType

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str = "direct"
    tags: List[str] = []

class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    status: LeadStatus
    assigned_to: Optional[str] = None
    created_at: datetime

class DealCreate(BaseModel):
    title: str
    amount: float
    lead_id: str
    expected_close_date: Optional[datetime] = None

class DealResponse(BaseModel):
    id: str
    title: str
    amount: float
    stage: DealStage
    probability: int
    lead_id: str
    owner_id: str
    created_at: datetime

class ActivityCreate(BaseModel):
    type: ActivityType
    content: str
    lead_id: Optional[str] = None
    deal_id: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    type: ActivityType
    content: str
    performed_by: str
    timestamp: datetime
