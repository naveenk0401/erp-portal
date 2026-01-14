from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from ..core.config import settings
from ..models.user import User
from beanie import PydanticObjectId
from ..core.tenant import set_tenant_id

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow preflight (OPTIONS) requests to pass through
        if request.method == "OPTIONS":
            return await call_next(request)

        # Exclude documentation and auth endpoints from middleware
        # Note: routes are prefixed with /api/v1 in main.py
        exempt_paths = [
            "/docs", "/openapi.json", "/redoc", "/",
            "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh"
        ]
        if request.url.path in exempt_paths:
            return await call_next(request)

        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return await self._unauthorized_response("Missing or invalid authorization header")

            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
                )
                email: str = payload.get("sub")
                user_id: str = payload.get("user_id")
                active_company_id: str = payload.get("active_company_id")
                is_refresh: bool = payload.get("refresh", False)
                
                if email is None or user_id is None or is_refresh:
                    return await self._unauthorized_response("Invalid token payload")

                # Inject into request state and context
                request.state.user_id = user_id
                request.state.active_company_id = active_company_id
                request.state.user_email = email
                
                if active_company_id:
                    set_tenant_id(PydanticObjectId(active_company_id))
                    
            except jwt.ExpiredSignatureError:
                return await self._unauthorized_response("Token has expired")
            except JWTError:
                return await self._unauthorized_response("Could not validate credentials")

            return await call_next(request)
        except Exception as e:
            import traceback
            print(f"ERROR IN AUTH MIDDLEWARE: {e}")
            traceback.print_exc()
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={"detail": f"Internal Server Error in Middleware: {str(e)}"}
            )

    async def _unauthorized_response(self, detail: str):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": detail},
            headers={"WWW-Authenticate": "Bearer"},
        )
