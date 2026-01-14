from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.core.auth import get_current_user
from app.models.user import User
from app.models.attendance import Attendance

router = APIRouter()

@router.get("/my-attendance", response_model=List[Attendance])
async def get_my_attendance(current_user: User = Depends(get_current_user)):
    """Get attendance logs for the current user"""
    return await Attendance.find(Attendance.user.id == current_user.id).sort(-Attendance.check_in).to_list()

@router.get("/all", response_model=List[Attendance])
async def get_all_attendance(current_user: User = Depends(get_current_user)):
    """Get all attendance logs (Admin/HR only)"""
    if current_user.role not in ["super_admin", "dept_admin", "hr"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await Attendance.find_all(fetch_links=True).to_list()

@router.post("/check-in")
async def check_in(current_user: User = Depends(get_current_user)):
    """Check in for the day"""
    today = datetime.utcnow().date()
    # Check if already checked in today
    existing = await Attendance.find_one(
        Attendance.user.id == current_user.id,
        Attendance.check_in >= datetime.combine(today, datetime.min.time())
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    new_attendance = Attendance(
        user=current_user,
        check_in=datetime.utcnow(),
        status="present"
    )
    await new_attendance.insert()
    return new_attendance

@router.post("/check-out")
async def check_out(current_user: User = Depends(get_current_user)):
    """Check out for the day"""
    today = datetime.utcnow().date()
    existing = await Attendance.find_one(
        Attendance.user.id == current_user.id,
        Attendance.check_in >= datetime.combine(today, datetime.min.time()),
        Attendance.check_out == None
    )
    if not existing:
        raise HTTPException(status_code=400, detail="Active check-in not found for today")
    
    existing.check_out = datetime.utcnow()
    await existing.save()
    return existing

@router.post("/admin-action")
async def admin_action(
    user_id: str = Query(...),
    action: str = Query(...),
    current_user: User = Depends(get_current_user)
):
    """Force check-in/out for an employee (Admin only)"""
    if current_user.role not in ["super_admin", "hr"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    target_user = await User.get(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    today = datetime.utcnow().date()
    
    if action == "check-in":
        existing = await Attendance.find_one(
            Attendance.user.id == target_user.id,
            Attendance.check_in >= datetime.combine(today, datetime.min.time())
        )
        if existing:
            raise HTTPException(status_code=400, detail="Employee already checked in today")
        
        new_att = Attendance(user=target_user, check_in=datetime.utcnow(), status="present")
        await new_att.insert()
        return new_att
        
    elif action == "check-out":
        existing = await Attendance.find_one(
            Attendance.user.id == target_user.id,
            Attendance.check_in >= datetime.combine(today, datetime.min.time()),
            Attendance.check_out == None
        )
        if not existing:
            raise HTTPException(status_code=400, detail="No active check-in found for today")
            
        existing.check_out = datetime.utcnow()
        await existing.save()
        return existing
    
    raise HTTPException(status_code=400, detail="Invalid action")
