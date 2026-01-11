from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.core.auth import get_current_user
from app.models.user import User
from app.models.crm import Lead, Deal, Activity
from app.schemas.crm import LeadCreate, LeadResponse, DealCreate, DealResponse, ActivityCreate, ActivityResponse
from app.services.crm_service import LeadService, DealService, ActivityService
from app.repositories.crm_repo import LeadRepository, DealRepository, ActivityRepository
from app.core.response import success_response, error_response
from app.core.permissions import check_permission, Scope

router = APIRouter()

# Dependency injection for services (simplified for this architectural demo)
lead_service = LeadService(LeadRepository())
deal_service = DealService(DealRepository())
activity_service = ActivityService(ActivityRepository())

@router.get("/leads", response_model=Dict[str, Any])
async def get_leads(
    current_user: User = Depends(get_current_user),
    scope: Scope = Depends(check_permission("crm.leads.view"))
):
    if scope == Scope.ALL:
        leads = await lead_service.lead_repo.find_all()
    elif scope == Scope.DEPARTMENT:
        # Filter by department logic would go here
        leads = await lead_service.lead_repo.find_all()
    else:
        leads = await lead_service.lead_repo.get_leads_by_assigned_user(str(current_user.id))
    
    return success_response(message="Leads retrieved successfully", data=leads)

@router.post("/leads", response_model=Dict[str, Any])
async def create_lead(
    lead_in: LeadCreate,
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("crm.leads.create"))
):
    lead = Lead(**lead_in.dict())
    created_lead = await lead_service.create(lead)
    return success_response(message="Lead created successfully", data=created_lead)

@router.get("/deals", response_model=Dict[str, Any])
async def get_deals(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("crm.deals.view"))
):
    deals = await deal_service.deal_repo.find_all()
    return success_response(message="Deals retrieved successfully", data=deals)

@router.post("/deals", response_model=Dict[str, Any])
async def create_deal(
    deal_in: DealCreate,
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("crm.deals.create"))
):
    deal = Deal(
        title=deal_in.title,
        amount=deal_in.amount,
        lead=deal_in.lead_id,
        owner=current_user,
        expected_close_date=deal_in.expected_close_date
    )
    created_deal = await deal_service.create(deal)
    return success_response(message="Deal created successfully", data=created_deal)

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_crm_dashboard(
    current_user: User = Depends(get_current_user),
    _ = Depends(check_permission("crm.dashboard.view"))
):
    forecast = await deal_service.get_revenue_forecast()
    # Add more aggregated metrics here
    return success_response(message="CRM Dashboard data retrieved", data={
        "forecast": forecast,
        "active_leads_count": await lead_service.lead_repo.model.count(),
        "deal_pipeline_value": 0 # Placeholder
    })
