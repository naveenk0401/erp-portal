from supabase import create_client, Client
from app.core.config import settings

class StorageService:
    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        else:
            self.supabase = None

    async def upload_file(self, file_path: str, file_content: bytes, content_type: str):
        if not self.supabase:
            return None
        
        response = self.supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": content_type}
        )
        return response

    async def get_file_url(self, file_path: str):
        if not self.supabase:
            return None
        
        return self.supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(file_path)

storage_service = StorageService()
