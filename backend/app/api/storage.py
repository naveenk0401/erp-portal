from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from ..services.storage import storage_service
from ..api.deps import get_current_user
from ..models.user import User

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = "general",
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file to Supabase Storage and return the path and a temporary signed URL.
    Restricts to images and PDFs, max 5MB.
    """
    # Use tenant isolation for folders if possible
    # We can prefix the folder with company_id
    company_prefix = str(current_user.active_company_id) if current_user.active_company_id else "public"
    tenant_folder = f"{company_prefix}/{folder}"
    
    path, filename = await storage_service.upload_file(file, folder=tenant_folder)
    signed_url = storage_service.get_signed_url(path)
    
    return {
        "path": path,
        "filename": filename,
        "signed_url": signed_url
    }

@router.get("/signed-url")
def get_signed_url(
    path: str,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a new signed URL for an existing file.
    """
    # Security check: Ensure the path belongs to the user's company
    company_prefix = str(current_user.active_company_id) if current_user.active_company_id else "public"
    if not path.startswith(company_prefix):
         raise HTTPException(status_code=403, detail="Access denied to this file")
         
    signed_url = storage_service.get_signed_url(path)
    return {"signed_url": signed_url}
