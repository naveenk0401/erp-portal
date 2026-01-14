from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.user import User
from app.models.onboarding import Onboarding
from app.models.copilot import CopilotKnowledge, UnansweredQuestion
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

async def query_onboarding_status(user: User):
    onboarding = await Onboarding.find_one(Onboarding.user == user.id)
    if not onboarding:
        return "You haven't started your onboarding yet. Please head to the HR section to begin."
    
    sections = ['basic', 'job', 'contact', 'bank', 'docs']
    completed = []
    for s in sections:
        data = getattr(onboarding, s, {})
        if data and any(data.values()):
            completed.append(s)
    
    progress = int((len(completed) / len(sections)) * 100)
    return f"Your onboarding status is: {onboarding.status}. You have completed {progress}% of the process (Sections: {', '.join(completed)})."

from app.core.response import success_response, StandardResponse
from app.services.copilot_service import CopilotService

@router.get("/query", response_model=StandardResponse)
async def copilot_query(q: str, user: User = Depends(get_current_user)):
    q_lower = q.lower()
    
    # 1. Dynamic Onboarding check
    if "onboarding" in q_lower or "provisioning" in q_lower:
        answer = await query_onboarding_status(user)
        return success_response(
            message="Dynamic query executed",
            data={
                "query": q,
                "answer": answer,
                "logic_applied": "Dynamic Onboarding Query",
                "context": "HR Onboarding"
            }
        )
    
    # 2. Check CopilotKnowledge collection
    knowledges = await CopilotKnowledge.find_all().to_list()
    for k in knowledges:
        if any(keyword.lower() in q_lower for keyword in k.keywords):
            return success_response(
                message="Knowledge retrieved",
                data={
                    "query": q,
                    "answer": k.answer,
                    "logic_applied": k.logic or "Keyword Match",
                    "context": k.category
                }
            )
            
    # 3. If no answer found, save as UnansweredQuestion
    already_saved = await UnansweredQuestion.find_one(UnansweredQuestion.query == q)
    if not already_saved:
        unanswered = UnansweredQuestion(
            query=q,
            user_id=str(user.id),
            context="General Query"
        )
        await unanswered.insert()
        logger.info(f"Saved unanswered question: {q}")

    return success_response(
        message="Question logged for learning",
        data={
            "query": q,
            "answer": "I don't know the answer to that yet, but I've saved your question. Once I learn the answer, I'll be able to help you next time!",
            "logic_applied": "Learning Triggered",
            "context": "General"
        }
    )

@router.post("/train-auto", response_model=StandardResponse)
async def auto_train_copilot(user: User = Depends(get_current_user)):
    """Triggers an automated system-wide knowledge ingestion"""
    try:
        results = await CopilotService.run_automated_training()
        return success_response(message="Neural synchronization complete", data=results)
    except Exception as e:
        logger.error(f"Training Error: {str(e)}")
        raise e
