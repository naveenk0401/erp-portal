from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.response import error_response

class ERPBaseException(Exception):
    def __init__(self, message: str, error_code: str, status_code: int = 400, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details

class PermissionDeniedException(ERPBaseException):
    def __init__(self, message: str = "Permission denied", details: dict = None):
        super().__init__(message, "PERMISSION_DENIED", 403, details)

class NotFoundException(ERPBaseException):
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(message, "NOT_FOUND", 404, details)

async def erp_exception_handler(request: Request, exc: ERPBaseException):
    content = error_response(
        message=exc.message,
        error_code=exc.error_code,
        details=exc.details
    ).dict()
    return JSONResponse(status_code=exc.status_code, content=content)

async def generic_exception_handler(request: Request, exc: Exception):
    # In production, log this properly
    content = error_response(
        message="An internal server error occurred",
        error_code="INTERNAL_SERVER_ERROR",
        details={"raw_error": str(exc)}
    ).dict()
    return JSONResponse(status_code=500, content=content)
