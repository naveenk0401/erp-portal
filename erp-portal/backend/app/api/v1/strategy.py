from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.core.auth import get_current_user
from app.core.permissions import check_permission
from app.models.user import User
from app.services.strategy_service import StrategyService
from app.repositories.strategy_repo import StrategyRepository
from app.core.response import success_response, StandardResponse

router = APIRouter()
strategy_repo = StrategyRepository()
strategy_service = StrategyService(strategy_repo)

@router.get("/okrs", response_model=StandardResponse)
async def get_okrs(
    level: str = "company",
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("strategy.view"))
):
    """Retrieve strategic OKRs by level (company or department)"""
    try:
        okrs = await strategy_service.get_full_okr_list(level=level)
        return success_response(message=f"Strategic {level} OKRs retrieved", data=okrs)
    except Exception as e:
        print(f"[STRATEGY ERROR] Get OKRs ({level}): {str(e)}")
        raise e

@router.patch("/okrs/{okr_id}/key-results/{kr_index}", response_model=StandardResponse)
async def update_kr_progress(
    okr_id: str,
    kr_index: int,
    progress: float,
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("strategy.update"))
):
    """Update progress for a specific key result"""
    try:
        updated_okr = await strategy_service.update_key_result(okr_id, kr_index, progress)
        if not updated_okr:
            raise HTTPException(status_code=404, detail="OKR or Key Result not found")
        return success_response(message="Key Result updated", data=updated_okr)
    except Exception as e:
        print(f"[STRATEGY ERROR] Update KR: {str(e)}")
        raise e
