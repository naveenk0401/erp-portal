from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.auth import get_current_user
from app.models.user import User
from app.models.settings import UserSettings

router = APIRouter()

@router.get("/")
async def get_settings(current_user: User = Depends(get_current_user)):
    settings = await UserSettings.find_one(UserSettings.user == current_user.id)
    if not settings:
        settings = UserSettings(user=current_user)
        await settings.insert()
    return settings

@router.patch("/")
async def update_settings(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    settings = await UserSettings.find_one(UserSettings.user == current_user.id)
    if not settings:
        settings = UserSettings(user=current_user)
        await settings.insert()
    
    for key, value in data.items():
        setattr(settings, key, value)
    
    settings.updated_at = datetime.utcnow()
    await settings.save()
    return settings
