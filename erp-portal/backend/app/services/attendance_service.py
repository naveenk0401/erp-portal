from datetime import datetime
from app.services.base_service import BaseService
from app.repositories.attendance_repo import AttendanceRepository
from app.models.attendance import Attendance
from app.models.user import User
from app.core.errors import ERPBaseException

class AttendanceService(BaseService[Attendance]):
    def __init__(self, attendance_repo: AttendanceRepository):
        super().__init__(attendance_repo)
        self.attendance_repo = attendance_repo

    async def check_in_user(self, user: User):
        existing = await self.attendance_repo.get_today_attendance(str(user.id))
        if existing:
            raise ERPBaseException(message="Already checked in today", error_code="ATTENDANCE_ALREADY_EXISTS", status_code=400)
        
        attendance = Attendance(user=user, check_in=datetime.utcnow())
        return await self.attendance_repo.create(attendance)

    async def check_out_user(self, user: User):
        attendance = await self.attendance_repo.get_active_checkin(str(user.id))
        if not attendance:
            raise ERPBaseException(message="No active check-in found", error_code="ATTENDANCE_NOT_FOUND", status_code=400)
        
        attendance.check_out = datetime.utcnow()
        await attendance.save()
        return attendance
