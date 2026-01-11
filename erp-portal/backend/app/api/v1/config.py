from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class VerifyRequest(BaseModel):
    input: str

@router.get("/")
async def get_config():
    return {
        "api_url": "http://localhost:8000/api/v1",
        "app_name": "ERP Portal",
        "features": {
            "attendance": True,
            "salaries": True,
            "tasks": True
        }
    }

@router.post("/verify")
async def verify_input(data: VerifyRequest):
    # Simulate database verification
    if data.input.lower() == "admin123" or data.input.lower() == "erp-secure":
        return {
            "status": "success", 
            "message": "Database verification successful! Access granted.",
            "redirect_url": "/dashboard"
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check your credentials.")
