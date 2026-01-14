from typing import List, Optional
from app.repositories.base_repo import BaseRepository
from app.models.strategy import OKR, PerformanceReview

class StrategyRepository(BaseRepository[OKR]):
    def __init__(self):
        super().__init__(OKR)

    async def get_all_okrs(self, fetch_links: bool = False) -> List[OKR]:
        """Retrieve all OKRs with owner links fetched if requested"""
        return await self.model.find_all(fetch_links=fetch_links).to_list()

    async def get_performance_reviews_for_user(self, user_id: str) -> List[PerformanceReview]:
        """Retrieve all performance reviews for a specific user"""
        return await PerformanceReview.find(
            PerformanceReview.user.id == user_id, 
            fetch_links=True
        ).to_list()
