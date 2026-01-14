from datetime import datetime
from typing import Optional, Dict, Any, List
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.user import User

class UserSettings(Document):
    user: Link[User]
    theme: str = "light"
    notifications_enabled: bool = True
    language: str = "en"
    dashboards_layout: Dict[str, Any] = {}
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_settings"
