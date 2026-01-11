from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.copilot import CopilotKnowledge, UnansweredQuestion
from app.models.user import User

class CopilotService:
    @staticmethod
    async def run_automated_training() -> Dict[str, Any]:
        """Indexes system modules and recent features into the knowledge base"""
        
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
                "keywords": ["hi", "hello", "hey", "greetings"],
                "answer": "Hello! I am your Enterprise ERP Copilot. I can help you with insights, onboarding status, CRM data, and more. How can I assist you today?",
                "category": "general"
            }
        ]
        
        total_indexed = 0
        for k_data in KNOWLEDGE_BASE:
            # Simple check for existing keywords
            existing = await CopilotKnowledge.find_one({"keywords": k_data["keywords"]})
            if not existing:
                knowledge = CopilotKnowledge(**k_data)
                await knowledge.insert()
                total_indexed += 1
        
        count = await CopilotKnowledge.count()
        unanswered = await UnansweredQuestion.count(UnansweredQuestion.is_resolved == False)
        
        return {
            "status": "success",
            "message": "Neural synchronization complete",
            "indexed_nodes": count,
            "newly_indexed": total_indexed,
            "pending_questions": unanswered,
            "last_trained": datetime.utcnow().isoformat()
        }

    @staticmethod
    async def get_brain_status() -> Dict[str, Any]:
        count = await CopilotKnowledge.count()
        unanswered = await UnansweredQuestion.count(UnansweredQuestion.is_resolved == False)
        return {
            "indexed_nodes": count,
            "pending_questions": unanswered
        }
