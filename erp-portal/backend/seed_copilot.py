import asyncio
import os
import sys
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.copilot import CopilotKnowledge
from app.core.config import settings

KNOWLEDGE_BASE = [
    {
        "keywords": ["insights", "predictive", "analytics", "module"],
        "answer": "The Insights module uses AI-driven predictive analytics to monitor organizational health, burnout velocity, and attrition risk. You can find it in the sidebar under 'Insights'.",
        "category": "insights"
    },
    {
        "keywords": ["burnout", "velocity", "stress", "employees"],
        "answer": "Burnout Velocity monitoring analyzes cross-departmental activity and identifies employees at risk due to excessive overtime or high on-call frequency. You can drill down into specific employee details by clicking on the Burnout Alert card.",
        "category": "insights"
    },
    {
        "keywords": ["acknowledge", "protocol", "alert", "log"],
        "answer": "The 'Acknowledge Protocol' feature allows administrators to formally record that a risk alert has been reviewed. This creates an immutable audit trail in the backend for compliance and tracking.",
        "category": "insights"
    },
    {
        "keywords": ["advanced", "modeling", "simulation", "monte carlo"],
        "answer": "Advanced Modeling runs sophisticated Monte Carlo simulations to project future organizational health based on current trends and hypothetical optimizations. It provides alternative scenarios and strategic recommendations.",
        "category": "insights"
    },
    {
        "keywords": ["crm", "pipeline", "leads", "deals"],
        "answer": "The CRM module allows you to manage leads, track deals through various pipeline stages, and forecast revenue. It is fully integrated with the ERP system for unified data management.",
        "category": "crm"
    },
    {
        "keywords": ["onboarding", "hr", "status"],
        "answer": "You can check your onboarding status by asking me 'What is my onboarding status?' or by visiting the HR section where detailed progress for basic info, banking, and documents is tracked.",
        "category": "hr"
    }
]

async def train_now():
    print("🚀 Initiating ERP Assistant Neural Training...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[CopilotKnowledge])
    
    total_new = 0
    for k in KNOWLEDGE_BASE:
        # Check if knowledge already exists (basic keyword check)
        existing = await CopilotKnowledge.find_one({"keywords": k["keywords"]})
        if not existing:
            knowledge = CopilotKnowledge(**k)
            await knowledge.insert()
            total_new += 1
            print(f"✅ Indexed: {k['category']} - {', '.join(k['keywords'][:2])}...")
    
    print(f"\n✨ Training Complete. Total new knowledge nodes added: {total_new}")

if __name__ == "__main__":
    asyncio.run(train_now())
