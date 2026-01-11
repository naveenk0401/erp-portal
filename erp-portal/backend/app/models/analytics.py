from typing import Dict, Any
from beanie import Document, Indexed
from datetime import datetime
from pydantic import Field

class DailyCompanyMetrics(Document):
    company_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    metrics: Dict[str, Any] # productivity, cost, revenue, attrition_risk, project_health
    
    class Settings:
        name = "company_metrics_daily"

class WeeklyDepartmentMetrics(Document):
    department_id: str
    week_start: datetime
    metrics: Dict[str, Any]
    
    class Settings:
        name = "department_metrics_weekly"

class MonthlyEmployeeMetrics(Document):
    user_id: str
    month: int
    year: int
    metrics: Dict[str, Any]
    
    class Settings:
        name = "employee_metrics_monthly"

class AlertAcknowledgment(Document):
    alert_id: str
    user_id: str
    acknowledged_at: datetime = Field(default_factory=datetime.utcnow)
    notes: str = None
    
    class Settings:
        name = "alert_acknowledgments"
