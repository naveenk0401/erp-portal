# from supabase import create_client, Client
from ..core.config import settings
from fastapi import HTTPException, status, UploadFile
import mimetypes
import uuid
from typing import Tuple

class StorageService:
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            # We don't raise immediately to allow the app to start, 
            # but methods will fail if keys are missing.
            self.client = None
        else:
            try:
                from supabase import create_client
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                print(f"FAILED TO INITIALIZE SUPABASE: {e}")
                self.client = None
            
    def _validate_file(self, file: UploadFile):
        # 1. Size validation
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_PAYLOAD_TOO_LARGE,
                detail=f"File too large. Max size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB"
            )
            
        # 2. MIME type validation
        mime_type, _ = mimetypes.guess_type(file.filename)
        allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {mime_type}. Allowed: images and PDFs."
            )
        return mime_type

    async def upload_file(self, file: UploadFile, folder: str = "general") -> Tuple[str, str]:
        if not self.client:
            raise HTTPException(status_code=500, detail="Supabase Storage not configured")
            
        self._validate_file(file)
        
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        path = f"{folder}/{file_name}"
        
        content = await file.read()
        
        try:
            res = self.client.storage.from_(settings.SUPABASE_BUCKET).upload(
                path=path,
                file=content,
                file_options={"content-type": file.content_type}
            )
            return path, file_name
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload to Supabase: {str(e)}"
            )

    def get_signed_url(self, path: str, expires_in: int = 3600) -> str:
        if not self.client:
            raise HTTPException(status_code=500, detail="Supabase Storage not configured")
            
        try:
            res = self.client.storage.from_(settings.SUPABASE_BUCKET).create_signed_url(
                path=path,
                expires_in=expires_in
            )
            return res.get("signedURL")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate signed URL: {str(e)}"
            )

storage_service = StorageService()
