from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models.crm import Lead, Deal, LeadStatus, DealStage
from app.models.engine import AuditLog

class CRMRuleService:
    @staticmethod
    async def get_uncontacted_leads(days: int = 3) -> List[Lead]:
        threshold = datetime.utcnow() - timedelta(days=days)
        return await Lead.find(
            Lead.status == LeadStatus.NEW,
            Lead.created_at < threshold
        ).to_list()

    @staticmethod
    async def get_stagnant_deals(days: int = 7) -> List[Deal]:
        threshold = datetime.utcnow() - timedelta(days=days)
        return await Deal.find(
            Deal.updated_at < threshold,
            Deal.stage != DealStage.CLOSED_WON,
            Deal.stage != DealStage.CLOSED_LOST
        ).to_list()

    @staticmethod
    async def get_high_value_alerts(threshold: float = 10000.0) -> List[Deal]:
        return await Deal.find(
            Deal.amount >= threshold,
            Deal.stage == DealStage.PROSPECTING
        ).to_list()
