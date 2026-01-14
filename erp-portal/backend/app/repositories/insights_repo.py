from datetime import datetime
from typing import List, Optional
from app.repositories.base_repo import BaseRepository
from app.models.analytics import DailyCompanyMetrics, WeeklyDepartmentMetrics

class InsightsRepository(BaseRepository[DailyCompanyMetrics]):
    def __init__(self):
        super().__init__(DailyCompanyMetrics)

    async def get_recent_company_metrics(self, limit: int = 30) -> List[DailyCompanyMetrics]:
        return await self.model.find_all().sort("-date").limit(limit).to_list()

    async def get_department_history(self, department_id: str, limit: int = 10) -> List[WeeklyDepartmentMetrics]:
        return await WeeklyDepartmentMetrics.find(
            WeeklyDepartmentMetrics.department_id == department_id
        ).sort("-week_start").limit(limit).to_list()
