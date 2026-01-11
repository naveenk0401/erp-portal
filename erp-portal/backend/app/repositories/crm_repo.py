from app.repositories.base_repo import BaseRepository
from app.models.crm import Lead, Deal, Activity, Customer

class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__(Lead)

    async def get_leads_by_assigned_user(self, user_id: str):
        return await self.find_many({"assigned_to": user_id})

class DealRepository(BaseRepository[Deal]):
    def __init__(self):
        super().__init__(Deal)

    async def get_high_value_deals(self, threshold: float):
        return await self.find_many({"amount": {"$gt": threshold}})

class ActivityRepository(BaseRepository[Activity]):
    def __init__(self):
        super().__init__(Activity)

    async def get_recent_activities(self, limit: int = 10):
        return await self.model.find_all().sort("-timestamp").limit(limit).to_list()
