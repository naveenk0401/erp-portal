from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from beanie import Document, Indexed, Link
from pydantic import Field, EmailStr
from app.models.user import User
from app.models.rbac import Department as DeptEnum

class OnboardingStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Department(Document):
    name: Indexed(str, unique=True)
    code: str # e.g. HR, SWE, SALES
    head: Optional[Link[User]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "departments"

class OnboardingRequest(Document):
    personal_details: Dict[str, Any]
    department_id: str
    designation: str
    salary_structure: Dict[str, Any]
    bank_details: Dict[str, Any]
    pf_details: Optional[Dict[str, Any]] = None
    esic_details: Optional[Dict[str, Any]] = None
    insurance_details: Optional[Dict[str, Any]] = None
    documents: List[Dict[str, str]] = [] # List of {type, url/id}
    
    status: OnboardingStatus = OnboardingStatus.DRAFT
    
    created_by: Link[User]
    approved_by: Optional[Link[User]] = None
    
    employee_code: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "onboarding_requests"
