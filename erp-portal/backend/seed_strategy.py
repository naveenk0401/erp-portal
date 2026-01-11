import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.strategy import OKR
from app.models.user import User
from app.core.config import settings

async def seed_strategy():
    print("🎯 Initiating Strategic Alignment Seeding...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[OKR, User])
    
    # 1. Get a user to own the OKRs
    admin = await User.find_one(User.role == "admin")
    if not admin:
        print("❌ No admin user found for seeding. Run seed_users first.")
        return

    # 2. Clear existing OKRs
    await OKR.find_all().delete()
    
    deadline = datetime.utcnow() + timedelta(days=90)
    
    okr_data = [
        {
            "title": "Scale Global Infrastructure",
            "description": "Expand cloud footprint and improve system uptime.",
            "target_value": 100.0,
            "unit": "%",
            "owner": admin,
            "deadline": deadline,
            "key_results": [
                {"text": "Achieve 99.99% uptime across all regions", "progress": 95.0},
                {"text": "Reduce latency by 20% in Asia-Pacific", "progress": 40.0},
                {"text": "Deploy 3 new edge locations", "progress": 66.0}
            ],
            "status": "on_track"
        },
        {
            "title": "Optimize Talent Retention",
            "description": "Reduce attrition and improve employee satisfaction scores.",
            "target_value": 100.0,
            "unit": "%",
            "owner": admin,
            "deadline": deadline,
            "key_results": [
                {"text": "Reduce engineering attrition by 5%", "progress": 20.0},
                {"text": "Launch internal mentorship program", "progress": 100.0},
                {"text": "Improve eNPS score to > 40", "progress": 30.0}
            ],
            "status": "at_risk"
        },
        {
            "title": "Revenue Growth Phase 2",
            "description": "Focus on high-value enterprise deals.",
            "target_value": 10.0,
            "unit": "M$",
            "owner": admin,
            "deadline": deadline,
            "key_results": [
                {"text": "Close 5 enterprise deals > $200k", "progress": 40.0},
                {"text": "Increase upsell revenue by 15%", "progress": 10.0}
            ],
            "status": "behind"
        }
    ]
    
    for o in okr_data:
        okr = OKR(**o)
        # Calculate initial current_value
        avg = sum(kr["progress"] for kr in okr.key_results) / len(okr.key_results)
        okr.current_value = round(avg, 2)
        await okr.insert()
        print(f"✅ Seeding OKR: {okr.title}")
    
    print("\n✨ Strategic Seeding Complete.")

if __name__ == "__main__":
    asyncio.run(seed_strategy())
