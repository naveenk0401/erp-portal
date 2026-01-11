from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.core.auth import get_current_user
from app.models.user import User
from app.models.content import WikiPage, DocumentRecord

router = APIRouter()

@router.get("/wiki", response_model=List[WikiPage])
async def get_wiki_pages():
    return await WikiPage.find_all().to_list()

@router.post("/wiki")
async def create_wiki_page(page: WikiPage, current_user: User = Depends(get_current_user)):
    page.author = current_user
    await page.insert()
    return page

@router.get("/documents", response_model=List[DocumentRecord])
async def get_documents(current_user: User = Depends(get_current_user)):
    return await DocumentRecord.find(DocumentRecord.owner == current_user.id).to_list()
