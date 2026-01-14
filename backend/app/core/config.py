from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ERP Portal API"
    MONGODB_URL: str
    DATABASE_NAME: str = "erp_portal"
    ALLOWED_ORIGINS: str = "*"
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "erp-uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024 # 5MB

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
