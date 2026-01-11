import asyncio
import random
from datetime import datetime, timedelta
from app.db import init_db
from app.models.analytics import DailyCompanyMetrics
from app.models.company import Company

async def seed_insights():
    await init_db()
    
    # Try to find a company to link to
    company = await Company.find_one({})
    company_id = str(company.id) if company else "COMP-001"
    
    # Clear existing metrics for fresh start
    await DailyCompanyMetrics.find_all().delete()
    
    print(f"Seeding 50 days of metric data for company: {company_id}...")
    
    base_date = datetime.utcnow()
    for i in range(50):
        target_date = base_date - timedelta(days=i)
        
        # Generate semi-realistic fluctuating metrics
        productivity = 75 + random.uniform(-10, 15)
        revenue_risk = 5 + random.uniform(0, 10)
        attrition_risk = 10 + random.uniform(-5, 5)
        project_health = 80 + random.uniform(-20, 10)
        
        metric = DailyCompanyMetrics(
            company_id=company_id,
            date=target_date,
            metrics={
                "productivity": round(productivity, 2),
                "revenue_risk": round(revenue_risk, 2),
                "attrition_risk": round(attrition_risk, 2),
                "project_health": round(project_health, 2),
                "active_users": random.randint(40, 60)
            }
        )
        await metric.insert()
        
    print("Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_insights())
