from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId
from ..models.company import Company
from ..models.user import User
from ..schemas.company import CompanyCreate, CompanyOut, CompanyUpdate
from ..schemas.user import Token, UserOut
from .deps import get_current_user
from ..services.role_service import init_company_roles, assign_admin_role

router = APIRouter()

@router.post("/", response_model=CompanyOut)
async def create_company(
    company_in: CompanyCreate, 
    current_user: User = Depends(get_current_user)
):
    new_company = Company(
        name=company_in.name,
        description=company_in.description,
        owner_id=current_user.id
    )
    await new_company.insert()
    
    # Update user's company list
    if current_user.company_ids is None:
        current_user.company_ids = []
    
    current_user.company_ids.append(new_company.id)
    if not current_user.active_company_id:
        current_user.active_company_id = new_company.id
        
    await current_user.save()
    
    # Initialize roles and assign admin
    await init_company_roles(new_company.id)
    await assign_admin_role(current_user, new_company.id)
    
    return new_company

@router.get("/", response_model=list[CompanyOut])
async def list_my_companies(current_user: User = Depends(get_current_user)):
    # Fetch all companies where user is in company_ids
    if not current_user.company_ids:
        return []
    companies = await Company.find({"_id": {"$in": current_user.company_ids}}).to_list()
    return companies

@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(
    company_id: str, 
    current_user: User = Depends(get_current_user)
):
    cid = PydanticObjectId(company_id)
    # Access Control: User must belong to the company
    if cid not in current_user.company_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this company"
        )
    
    company = await Company.get(cid)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return company

@router.put("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: str,
    company_in: CompanyUpdate,
    current_user: User = Depends(get_current_user)
):
    cid = PydanticObjectId(company_id)
    company = await Company.get(cid)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Only owner can update company details
    if company.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the company owner can update company details"
        )
        
    update_data = company_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
        
    await company.save()
    return company

@router.post("/select/{company_id}", response_model=Token)
async def select_active_company(
    company_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Sets the active company for the current user and returns new tokens with updated claims.
    """
    cid = PydanticObjectId(company_id)
    if cid not in current_user.company_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this company"
        )
    
    current_user.active_company_id = cid
    await current_user.save()
    
    # Generate new tokens with the updated active_company_id
    from ..core.security import create_access_token, create_refresh_token
    
    extra_claims = {
        "user_id": str(current_user.id),
        "active_company_id": str(current_user.active_company_id)
    }
    
    return {
        "access_token": create_access_token(current_user.email, extra_claims=extra_claims),
        "refresh_token": create_refresh_token(current_user.email),
        "token_type": "bearer"
    }

@router.get("/{company_id}/users", response_model=list[UserOut])
async def list_company_users(
    company_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    List all users who belong to the specified company.
    """
    cid = PydanticObjectId(company_id)
    if cid not in current_user.company_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this company"
        )
        
    users = await User.find(User.company_ids == cid).to_list()
    return users
