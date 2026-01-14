from app.models.user import User
from app.models.company import Company
from app.models.analytics import DailyCompanyMetrics
from datetime import datetime

async def aggregate_company_metrics_daily():
    companies = await Company.find_all().to_list()
    for company in companies:
        # Example aggregation logic
        user_count = await User.find(User.company.id == company.id).count()
        # Mock metrics
        metrics = {
            "productivity": 88.5,
            "cost": 50000.0,
            "revenue": 120000.0,
            "attrition_risk": 15.2,
            "project_health": 92.0
        }
        
        daily_metric = DailyCompanyMetrics(
            company_id=str(company.id),
            metrics=metrics
        )
        await daily_metric.insert()
