from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.core.auth import get_current_user
from app.core.permissions import check_permission
from app.models.user import User
from app.models.rbac import Scope
from app.services.insights_service import InsightsService
from app.repositories.insights_repo import InsightsRepository
from app.core.response import success_response, StandardResponse
from app.core.errors import NotFoundException

router = APIRouter()
insights_service = InsightsService(InsightsRepository())

@router.get("/summary", response_model=StandardResponse)
async def get_insights_summary(current_user: User = Depends(get_current_user)):
    """Standardized summary of predictive alerts and organizational health"""
    try:
        alerts = await insights_service.get_predictive_alerts()
        health = await insights_service.get_organizational_health()
        
        return success_response(
            message="Organizational insights retrieved",
            data={
                "alerts": alerts,
                "health": health
            }
        )
    except Exception as e:
        print(f"[INSIGHTS ERROR] Summary Summary: {str(e)}")
        # Re-raise to let global handler catch or handle it here
        raise e

@router.get("/historical-trends", response_model=StandardResponse)
async def get_historical_trends(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("insights.view"))
):
    """Retrieve historical data for trend visualization"""
    try:
        metrics = await insights_service.insights_repo.get_recent_company_metrics(limit=30)
        # Manually serialize to avoid ObjectId issues
        serializable_metrics = [
            {
                "id": str(m.id),
                "date": m.date.isoformat(),
                "metrics": m.metrics,
                "company_id": m.company_id
            } for m in metrics
        ]
        return success_response(message="Historical trends retrieved", data=serializable_metrics)
    except Exception as e:
        import traceback
        print(f"[INSIGHTS ERROR] Historical Trends: {str(e)}")
        print(traceback.format_exc())
        raise e

@router.get("/burnout/{user_id}", response_model=StandardResponse)
async def get_burnout_risk(
    user_id: str,
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("insights.view"))
):
    try:
        target_user = await User.get(user_id)
        if not target_user:
            raise NotFoundException(message="User not found")
            
        if scope == Scope.DEPARTMENT and target_user.department != current_user.department:
            from app.core.errors import PermissionDeniedException
            raise PermissionDeniedException("Unauthorized scope for department access")
            
        from app.services.engine import calculate_burnout_score
        risk = await calculate_burnout_score(target_user)
        return success_response(message="Burnout risk analyzed", data=risk)
    except Exception as e:
        print(f"[INSIGHTS ERROR] Burnout Risk: {str(e)}")
        raise e
@router.get("/detailed-risk", response_model=StandardResponse)
async def get_detailed_risk(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("insights.view"))
):
    """Retrieve detailed departmental risk breakdown"""
    try:
        breakdown = await insights_service.get_detailed_risk_breakdown()
        return success_response(message="Detailed risk breakdown retrieved", data=breakdown)
    except Exception as e:
        print(f"[INSIGHTS ERROR] Detailed Risk: {str(e)}")
        raise e

@router.post("/advanced-modeling", response_model=StandardResponse)
async def run_advanced_modeling(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("insights.view"))
):
    """Run advanced predictive modeling simulation"""
    try:
        results = await insights_service.run_advanced_modeling()
        return success_response(message="Advanced simulation completed", data=results)
    except Exception as e:
        print(f"[INSIGHTS ERROR] Advanced Modeling: {str(e)}")
        raise e

@router.post("/alerts/{alert_id}/acknowledge", response_model=StandardResponse)
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("insights.view"))
):
    """Acknowledge an alert protocol"""
    try:
        results = await insights_service.acknowledge_alert(alert_id, str(current_user.id))
        return success_response(message="Alert protocol acknowledged and logged", data=results)
    except Exception as e:
        print(f"[INSIGHTS ERROR] Acknowledge Alert: {str(e)}")
        raise e
