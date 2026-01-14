from typing import Any, Optional, Dict
from pydantic import BaseModel

class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    meta: Optional[Dict[str, Any]] = None

def success_response(message: str, data: Any = None, meta: Dict[str, Any] = None) -> StandardResponse:
    return StandardResponse(
        success=True,
        message=message,
        data=data,
        meta=meta
    )

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: str
    details: Optional[Dict[str, Any]] = None

def error_response(message: str, error_code: str, details: Dict[str, Any] = None) -> ErrorResponse:
    return ErrorResponse(
        success=False,
        message=message,
        error_code=error_code,
        details=details
    )
