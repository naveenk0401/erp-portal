from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.services.base_service import BaseService
from app.repositories.strategy_repo import StrategyRepository
from app.models.strategy import OKR
from app.models.user import User
from app.models.rbac import RoleEnum

class StrategyService(BaseService[OKR]):
    def __init__(self, strategy_repo: StrategyRepository):
        super().__init__(strategy_repo)
        self.strategy_repo = strategy_repo

    async def get_full_okr_list(self, level: str = "company") -> List[Dict[str, Any]]:
        """Retrieve OKRs and format them for the high-fidelity UI"""
        try:
            query = {"level": level}
            if level == "company":
                query = {"$or": [{"level": "company"}, {"level": {"$exists": False}}]}
                
            okrs = await self.strategy_repo.find_many(query)
            
            # Auto-Seed if empty
            if not okrs:
                print(f"[STRATEGY SERVICE] No OKRs found for {level}. Checking defaults...")
                await self._seed_defaults()
                okrs = await self.strategy_repo.find_many(query)

            formatted_okrs = []
            for okr in okrs:
                # Manually fetch owner if needed for name
                owner_name = "Organization"
                if okr.owner:
                    try:
                        await okr.fetch_link("owner")
                        if okr.owner:
                            owner_name = okr.owner.full_name if hasattr(okr.owner, 'full_name') else f"{okr.owner.first_name} {okr.owner.last_name}"
                    except Exception as e:
                        print(f"[STRATEGY SERVICE] Error fetching owner link: {str(e)}")
                        pass

                # Calculate aggregate progress from key results if they exist
                if okr.key_results:
                    avg_progress = sum(kr.get("progress", 0) for kr in okr.key_results) / len(okr.key_results)
                    okr.current_value = round(avg_progress, 2)
                
                # Auto-status detection based on progress vs deadline
                if okr.current_value < 30:
                    okr.status = "behind"
                elif okr.current_value < 70:
                    okr.status = "at_risk"
                else:
                    okr.status = "on_track"

                formatted_okrs.append({
                    "id": str(okr.id),
                    "title": okr.title,
                    "description": okr.description,
                    "current_value": okr.current_value,
                    "target_value": okr.target_value,
                    "status": okr.status,
                    "owner_name": owner_name,
                    "key_results": okr.key_results,
                    "deadline": okr.deadline.isoformat() if okr.deadline else None,
                    "unit": okr.unit
                })
                
            return formatted_okrs
        except Exception as e:
            print(f"[STRATEGY SERVICE] Critical error in get_full_okr_list: {str(e)}")
            raise e

    async def update_key_result(self, okr_id: str, kr_index: int, new_progress: float) -> Optional[OKR]:
        """Update a specific key result's progress and recalculate OKR progress"""
        okr = await self.strategy_repo.get_by_id(okr_id)
        if not okr or kr_index >= len(okr.key_results):
            return None
        
        okr.key_results[kr_index]["progress"] = new_progress
        
        # Recalculate main progress
        avg_progress = sum(kr.get("progress", 0) for kr in okr.key_results) / len(okr.key_results)
        okr.current_value = round(avg_progress, 2)
        
        await okr.save()
        return okr

    async def _seed_defaults(self):
        """Internal helper to seed default OKRs if system is empty"""
        print("[STRATEGY SEED] Looking for a user to own default OKRs...")
        admin = await User.find_one(User.role == RoleEnum.SUPER_ADMIN)
        if not admin:
            print("[STRATEGY SEED] No super_admin found, falling back to any available user")
            admin = await User.find_one()
            
        if not admin:
            print("[STRATEGY SEED] FATAL: No users found in database. Cannot seed OKRs.")
            return

        print(f"[STRATEGY SEED] Seeding OKRs for user: {admin.email}")
        deadline = datetime.utcnow() + timedelta(days=90)
        defaults = [
            {
                "title": "Scale Global Infrastructure",
                "description": "Expand cloud footprint and improve system uptime.",
                "target_value": 100.0,
                "unit": "%",
                "owner": admin,
                "deadline": deadline,
                "level": "company",
                "key_results": [
                    {"text": "Achieve 99.99% uptime across all regions", "progress": 95.0},
                    {"text": "Reduce latency by 20% in Asia-Pacific", "progress": 40.0}
                ]
            },
            {
                "title": "Optimize Talent Retention",
                "description": "Reduce attrition and improve employee satisfaction scores.",
                "target_value": 100.0,
                "unit": "%",
                "owner": admin,
                "deadline": deadline,
                "level": "company",
                "key_results": [
                    {"text": "Reduce engineering attrition by 5%", "progress": 20.0},
                    {"text": "Launch internal mentorship program", "progress": 100.0}
                ]
            },
            {
                "title": "Software Dept: CI/CD Optimization",
                "description": "Improve deployment frequency and reduce failure rate.",
                "target_value": 100.0,
                "unit": "%",
                "owner": admin,
                "deadline": deadline,
                "level": "department",
                "department": "software",
                "key_results": [
                    {"text": "Reduce build time to under 5 mins", "progress": 85.0},
                    {"text": "Achieve 80% test coverage", "progress": 60.0}
                ]
            },
            {
                "title": "Sales Dept: Pipeline Expansion",
                "description": "Increase top-of-funnel leads significantly.",
                "target_value": 500,
                "unit": "leads",
                "owner": admin,
                "deadline": deadline,
                "level": "department",
                "department": "sales",
                "key_results": [
                    {"text": "Run 3 new outreach campaigns", "progress": 100.0},
                    {"text": "Qualify 150 MQLs", "progress": 45.0}
                ]
            }
        ]
        
        for d in defaults:
            existing = await OKR.find_one(OKR.title == d["title"])
            if existing:
                continue
                
            okr = OKR(**d)
            # Calculate initial current_value
            avg = sum(kr["progress"] for kr in okr.key_results) / len(okr.key_results)
            okr.current_value = round(avg, 2)
            await okr.insert()
            print(f"[STRATEGY SEED] Successfully inserted OKR: {okr.title}")
