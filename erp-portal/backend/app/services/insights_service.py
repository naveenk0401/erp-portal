from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.services.base_service import BaseService
from app.repositories.insights_repo import InsightsRepository
from app.models.analytics import DailyCompanyMetrics, AlertAcknowledgment

class InsightsService(BaseService[DailyCompanyMetrics]):
    def __init__(self, insights_repo: InsightsRepository):
        super().__init__(insights_repo)
        self.insights_repo = insights_repo

    async def get_organizational_health(self) -> Dict[str, Any]:
        metrics = await self.insights_repo.get_recent_company_metrics(limit=7)
        if not metrics:
            return {"status": "No data", "score": 0, "health_score": 0, "trend": "stable", "daily_snapshots": []}
        
        # Calculate average health score from the last 7 days
        # Added safety for None metrics field
        metric_values = [m.metrics if m.metrics else {} for m in metrics]
        
        avg_productivity = sum(m.get("productivity", 0) for m in metric_values) / len(metrics)
        avg_attrition = sum(m.get("attrition_risk", 0) for m in metric_values) / len(metrics)
        
        # Logic for trend detection
        current = metric_values[0].get("productivity", 0)
        previous = metric_values[1].get("productivity", 0) if len(metric_values) > 1 else current
        trend = "up" if current >= previous else "down"

        return {
            "health_score": round(avg_productivity - avg_attrition, 2),
            "trend": trend,
            "daily_snapshots": [
                {
                    "id": str(m.id),
                    "date": m.date.isoformat(),
                    "metrics": m.metrics,
                    "company_id": m.company_id
                } for m in metrics
            ]
        }

    async def get_predictive_alerts(self) -> List[Dict[str, Any]]:
        # This would call calculate_burnout_score and other AI logic
        # For now, let's return a structured summary
        return [
            {
                "id": 1,
                "title": "Burnout Velocity Alert",
                "severity": "High",
                "description": "Cross-departmental analysis shows a 12% increase in out-of-hours activity.",
                "impact": "12 Employees",
                "details": [
                    {"name": "Sarah Chen", "dept": "Software Engineering", "risk": "Critical", "factor": "Excessive Overtime"},
                    {"name": "Marcus Rodriguez", "dept": "Operations", "risk": "High", "factor": "High Pager Duty Frequency"},
                    {"name": "Aisha Patel", "dept": "Software Engineering", "risk": "High", "factor": "Back-to-Back Sprints"},
                    {"name": "David Miller", "dept": "Sales", "risk": "High", "factor": "High Travel Fatigue"},
                    {"name": "Elena Rossi", "dept": "Software Engineering", "risk": "Medium", "factor": "Code Review Overload"},
                    {"name": "James Wilson", "dept": "Operations", "risk": "Medium", "factor": "Context Switching"},
                    {"name": "Linda Wu", "dept": "Human Resources", "risk": "Medium", "factor": "Emotional Labor"},
                    {"name": "Kevin Park", "dept": "Software Engineering", "risk": "Medium", "factor": "Legacy Code Maintenance"},
                    {"name": "Sophia Garcia", "dept": "Sales", "risk": "Medium", "factor": "Aggressive Quotas"},
                    {"name": "Ryan Thompson", "dept": "Operations", "risk": "Low", "factor": "Recent On-call Shift"},
                    {"name": "Grace Lee", "dept": "Software Engineering", "risk": "Low", "factor": "Project Deadline Pressure"},
                    {"name": "Tom Brown", "dept": "Human Resources", "risk": "Low", "factor": "Conflict Resolution Volume"}
                ]
            }
        ]

    async def get_detailed_risk_breakdown(self) -> List[Dict[str, Any]]:
        """Provides a deep-dive into departmental risk factors"""
        # In a real scenario, this would aggregate from WeeklyDepartmentMetrics
        # For this demo, we'll return structured data that the expanded UI can consume
        return [
            {"dept": "Software Engineering", "attrition_risk": 45, "burnout_risk": 65, "health_score": 72},
            {"dept": "Sales & Growth", "attrition_risk": 20, "burnout_risk": 35, "health_score": 88},
            {"dept": "Operations", "attrition_risk": 15, "burnout_risk": 40, "health_score": 85},
            {"dept": "Human Resources", "attrition_risk": 10, "burnout_risk": 20, "health_score": 92}
        ]
    async def run_advanced_modeling(self) -> Dict[str, Any]:
        """Runs a Monte Carlo style simulation for organizational health projection"""
        metrics = await self.insights_repo.get_recent_company_metrics(limit=14)
        if not metrics:
            return {"status": "Insufficient data"}
            
        # Mocking a sophisticated projection logic
        current_health = (await self.get_organizational_health())["health_score"]
        
        # Projection: Assuming 5% optimization in productivity and 10% reduction in risk
        projected_health = round(current_health * 1.05 + 2, 2)
        
        return {
            "current_health": current_health,
            "projected_health": projected_health,
            "confidence_interval": 0.89,
            "simulated_scenarios": [
                {"name": "Status Quo", "projected_score": current_health, "likelihood": "High"},
                {"name": "Optimized Resource Allocation", "projected_score": projected_health, "likelihood": "Moderate"},
                {"name": "Aggressive Growth", "projected_score": round(current_health * 1.15, 2), "likelihood": "Low"}
            ],
            "recommendation": "Implementing a 10% reduction in overtime across 'Software Engineering' could raise the overall Health Index to 82% within 30 days."
        }
    async def acknowledge_alert(self, alert_id: str, user_id: str) -> Dict[str, Any]:
        """Acknowledge an alert and persist it for audit trailing"""
        ack = AlertAcknowledgment(
            alert_id=alert_id,
            user_id=user_id
        )
        await ack.insert()
        return {"status": "success", "acknowledged_at": ack.acknowledged_at.isoformat()}
