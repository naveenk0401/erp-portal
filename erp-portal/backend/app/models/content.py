from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class WikiPage(Document):
    title: str
    slug: Indexed(str, unique=True)
    content: str
    author: Link[User]
    category: str = "general"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "wiki_pages"

class DocumentRecord(Document):
    name: str
    file_url: str
    file_type: str # PDF, Docx, etc.
    size: int
    owner: Link[User]
    category: str = "general" # legal, payroll, technical
    is_public: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "documents"
