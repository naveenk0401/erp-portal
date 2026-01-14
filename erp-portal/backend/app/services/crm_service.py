from datetime import datetime
from typing import List, Dict, Any
from app.services.base_service import BaseService
from app.repositories.crm_repo import LeadRepository, DealRepository, ActivityRepository
from app.models.crm import Lead, Deal, Activity, LeadStatus, DealStage
from app.models.user import User

class LeadService(BaseService[Lead]):
    def __init__(self, lead_repo: LeadRepository):
        super().__init__(lead_repo)
        self.lead_repo = lead_repo

    async def assign_lead(self, lead_id: str, user_id: str):
        lead = await self.lead_repo.get_by_id(lead_id)
        if lead:
            lead.assigned_to = user_id
            lead.status = LeadStatus.CONTACTED
            await lead.save()
            return lead
        return None

class DealService(BaseService[Deal]):
    def __init__(self, deal_repo: DealRepository):
        super().__init__(deal_repo)
        self.deal_repo = deal_repo

    async def update_stage(self, deal_id: str, new_stage: DealStage):
        deal = await self.deal_repo.get_by_id(deal_id)
        if deal:
            deal.stage = new_stage
            await deal.save()
            return deal
        return None

    async def get_revenue_forecast(self) -> Dict[str, float]:
        deals = await self.deal_repo.find_many({"stage": {"$nin": [DealStage.CLOSED_WON, DealStage.CLOSED_LOST]}})
        forecast = sum(d.amount * (d.probability / 100) for d in deals)
        return {"projected_revenue": forecast}

class ActivityService(BaseService[Activity]):
    def __init__(self, activity_repo: ActivityRepository):
        super().__init__(activity_repo)
        self.activity_repo = activity_repo

    async def log_activity(self, type: str, content: str, user_id: str, lead_id: str = None, deal_id: str = None):
        activity = Activity(
            type=type,
            content=content,
            performed_by=user_id,
            lead=lead_id,
            deal=deal_id
        )
        return await self.activity_repo.create(activity)
