from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import erp_exception_handler, generic_exception_handler, ERPBaseException
from app.api.v1 import copilot, insights, config, hr, hr_workflow, hr_api, ops_api, finance_api, strategy, content_api, approvals, dashboard, settings_api, admin_api, crm
from app.api import users, attendance, tasks, salaries, auth, onboarding
from app.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="ERP Portal API", 
    version="1.0.0",
    lifespan=lifespan
)

# Exception Handlers
app.add_exception_handler(ERPBaseException, erp_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS Middleware - MUST be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth & Logout
@app.post("/api/v1/auth/logout", tags=["auth"])
async def logout():
    return {"message": "Logged out successfully"}

# API Versioning
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["attendance"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(salaries.router, prefix="/api/v1/salaries", tags=["salaries"])
app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["onboarding"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["copilot"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["insights"])
app.include_router(config.router, prefix="/api/v1/config", tags=["config"])
app.include_router(hr.router, prefix="/api/v1/hr", tags=["hr"])
app.include_router(hr_workflow.router, prefix="/api/v1/hr-panel", tags=["hr-panel"])
app.include_router(hr_api.router, prefix="/api/v1/hr-core", tags=["hr-core"])
app.include_router(ops_api.router, prefix="/api/v1/operations", tags=["operations"])
app.include_router(finance_api.router, prefix="/api/v1/finance", tags=["finance"])
app.include_router(strategy.router, prefix="/api/v1/strategy", tags=["strategy"])
app.include_router(content_api.router, prefix="/api/v1/content", tags=["content"])
app.include_router(approvals.router, prefix="/api/v1/approvals", tags=["approvals"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(settings_api.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(admin_api.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])

@app.get("/")
async def root():
    return {"message": "Welcome to ERP Portal API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
