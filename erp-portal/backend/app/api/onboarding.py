from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.core.auth import get_current_user
from app.models.user import User
from app.models.onboarding import Onboarding
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class OnboardingData(BaseModel):
    basic: Dict[str, Any]
    job: Dict[str, Any]
    contact: Dict[str, Any]
    bank: Dict[str, Any]
    docs: Optional[Dict[str, Any]] = {}
    status: str = "Draft"

@router.get("")
async def get_onboarding(
    current_user: User = Depends(get_current_user)
):
    """Get current user's onboarding data"""
    try:
        onboarding = await Onboarding.find_one(Onboarding.user == current_user.id)
        if not onboarding:
            return {
                "status": "success",
                "data": None
            }
        
        return {
            "status": "success",
            "data": onboarding
        }
    except Exception as e:
        logger.error(f"Error fetching onboarding: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch onboarding data"
        )

@router.post("/save")
async def save_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_user)
):
    """Save onboarding draft data"""
    try:
        onboarding = await Onboarding.find_one(Onboarding.user == current_user.id)
        
        if onboarding:
            onboarding.basic = data.basic
            onboarding.job = data.job
            onboarding.contact = data.contact
            onboarding.bank = data.bank
            onboarding.docs = data.docs or {}
            onboarding.status = data.status
            onboarding.updated_at = datetime.utcnow()
            await onboarding.save()
        else:
            onboarding = Onboarding(
                user=current_user,
                basic=data.basic,
                job=data.job,
                contact=data.contact,
                bank=data.bank,
                docs=data.docs or {},
                status=data.status
            )
            await onboarding.insert()
        
        logger.info(f"Onboarding draft saved for user {current_user.id}")
        
        return {
            "status": "success",
            "message": "Onboarding data saved successfully",
            "data": onboarding
        }
    except Exception as e:
        logger.error(f"Error saving onboarding: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save onboarding data"
        )

@router.post("/submit")
async def submit_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_user)
):
    """Submit onboarding for approval"""
    try:
        # Validate required fields
        required_fields = {
            'basic': ['fullName', 'dateOfBirth', 'gender', 'nationality'],
            'job': ['department', 'designation', 'dateOfJoining', 'employmentType'],
            'contact': ['email', 'phone', 'address', 'city'],
            'bank': ['accountNumber', 'ifscCode', 'bankName', 'salary']
        }
        
        for section, fields in required_fields.items():
            section_data = data.basic if section == 'basic' else \
                          data.job if section == 'job' else \
                          data.contact if section == 'contact' else \
                          data.bank
            for field in fields:
                if not section_data.get(field):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Missing required field: {field} in {section}"
                    )
        
        onboarding = await Onboarding.find_one(Onboarding.user == current_user.id)
        
        if onboarding:
            onboarding.basic = data.basic
            onboarding.job = data.job
            onboarding.contact = data.contact
            onboarding.bank = data.bank
            onboarding.docs = data.docs or {}
            onboarding.status = "Submitted"
            onboarding.updated_at = datetime.utcnow()
            await onboarding.save()
        else:
            onboarding = Onboarding(
                user=current_user,
                basic=data.basic,
                job=data.job,
                contact=data.contact,
                bank=data.bank,
                docs=data.docs or {},
                status="Submitted"
            )
            await onboarding.insert()
        
        logger.info(f"Onboarding submitted for user {current_user.id}")
        
        return {
            "status": "success",
            "message": "Onboarding submitted for approval",
            "data": onboarding
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting onboarding: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit onboarding"
        )
