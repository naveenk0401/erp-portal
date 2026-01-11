from typing import Dict, Any
from beanie import Document, Indexed
from app.schemas.base import AuditBaseSchema

class ScoreConfig(Document):
    name: Indexed(str, unique=True) # attrition, burnout, delay, revenue
    weights: Dict[str, float]
    is_active: bool = True
    
    class Settings:
        name = "score_configs"
