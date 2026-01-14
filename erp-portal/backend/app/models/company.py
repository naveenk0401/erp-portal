from typing import Optional
from beanie import Document, Indexed
from app.schemas.base import AuditBaseSchema

class Company(Document):
    name: Indexed(str, unique=True)
    domain: Optional[str] = None
    is_active: bool = True
    
    class Settings:
        name = "companies"
