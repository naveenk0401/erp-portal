from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed
from pydantic import Field

class CopilotKnowledge(Document):
    keywords: List[str]
    answer: str
    logic: Optional[str] = None
    category: str = "general"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "copilot_knowledge"

class UnansweredQuestion(Document):
    query: str
    user_id: str
    context: Optional[str] = None
    is_resolved: bool = False
    resolved_answer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "unanswered_questions"
