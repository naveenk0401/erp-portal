from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.company import Company
from app.models.scoring import ScoreConfig
from app.models.analytics import DailyCompanyMetrics, WeeklyDepartmentMetrics, MonthlyEmployeeMetrics, AlertAcknowledgment
from app.models.attendance import Attendance
from app.models.task import Task
from app.models.salary import Salary
from app.models.rbac import Role, Permission
from app.models.hr_workflow import Department, OnboardingRequest
from app.models.onboarding import Onboarding
from app.models.hr import Leave, IDCard
from app.models.ops import Project, Sprint, Asset
from app.models.content import WikiPage, DocumentRecord
from app.models.strategy import OKR, PerformanceReview
from app.models.finance import Expense, PayrollRecord, Invoice
from app.models.approvals import ApprovalRequest
from app.models.settings import UserSettings
from app.models.copilot import CopilotKnowledge, UnansweredQuestion
from app.models.engine import AuditLog, Rule, RuleLog
from app.models.crm import Lead, Deal, Activity, Customer
from app.core.config import settings

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client.get_default_database(), 
        document_models=[
            User, Company, Role, Permission,
            Department, OnboardingRequest, Onboarding,
            Attendance, Task, Salary,
            Leave, IDCard, Project, Sprint, Asset,
            WikiPage, DocumentRecord, OKR, PerformanceReview,
            Expense, PayrollRecord, Invoice, ApprovalRequest,
            UserSettings, CopilotKnowledge, UnansweredQuestion,
            AuditLog, Rule, RuleLog, ScoreConfig,
            Lead, Deal, Activity, Customer,
            DailyCompanyMetrics, WeeklyDepartmentMetrics, MonthlyEmployeeMetrics, AlertAcknowledgment
        ]
    )
