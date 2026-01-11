from datetime import datetime
from app.repositories.base_repo import BaseRepository
from app.models.attendance import Attendance

class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self):
        super().__init__(Attendance)

    async def get_today_attendance(self, user_id: str):
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        return await self.model.find_one(
            Attendance.user.id == user_id,
            Attendance.date >= today_start
        )

    async def get_active_checkin(self, user_id: str):
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        return await self.model.find_one(
            Attendance.user.id == user_id,
            Attendance.date >= today_start,
            Attendance.check_out == None
        )

    async def get_by_user(self, user_id: str):
        return await self.model.find(Attendance.user.id == user_id).to_list()
