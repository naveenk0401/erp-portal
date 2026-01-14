from typing import TypeVar, Generic, List, Optional, Type
from beanie import PydanticObjectId
from pydantic import BaseModel
from datetime import datetime
from ..models.base import TenantDocument
from ..core.tenant import get_tenant_id
from fastapi import HTTPException, status

T = TypeVar("T", bound=TenantDocument)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    def _get_tenant_id(self) -> PydanticObjectId:
        tenant_id = get_tenant_id()
        if not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No active company context found"
            )
        return tenant_id

    async def get(self, id: PydanticObjectId, include_inactive: bool = False) -> Optional[T]:
        """Fetch a single document by ID, scoped to the current tenant."""
        filters = [
            self.model.id == id,
            self.model.company_id == self._get_tenant_id()
        ]
        if not include_inactive:
            filters.append(self.model.is_active == True)
            
        return await self.model.find_one(*filters)

    async def list(self, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> List[T]:
        """List documents scoped to the current tenant."""
        query = self.model.find(self.model.company_id == self._get_tenant_id())
        if not include_inactive:
            query = query.find(self.model.is_active == True)
            
        return await query.skip(skip).limit(limit).to_list()

    async def create(self, document_in: BaseModel) -> T:
        """Create a new document, automatically injecting the current tenant ID."""
        tenant_id = self._get_tenant_id()
        
        # Convert Pydantic model to Beanie document and inject company_id
        doc_dict = document_in.model_dump()
        doc_dict["company_id"] = tenant_id
        
        db_obj = self.model(**doc_dict)
        await db_obj.insert()
        return db_obj

    async def update(self, id: PydanticObjectId, document_in: BaseModel) -> Optional[T]:
        """Update a document, ensuring it belongs to the current tenant."""
        db_obj = await self.get(id, include_inactive=True)
        if not db_obj:
            return None
            
        update_data = document_in.model_dump(exclude_unset=True)
        # Ensure company_id is never changed via update
        update_data.pop("company_id", None)
        update_data["updated_at"] = datetime.utcnow()
        
        await db_obj.set(update_data)
        return db_obj

    async def deactivate(self, id: PydanticObjectId) -> bool:
        """Soft delete a document by setting is_active to False."""
        db_obj = await self.get(id)
        if not db_obj:
            return False
        
        await db_obj.set({self.model.is_active: False, self.model.updated_at: datetime.utcnow()})
        return True

    async def activate(self, id: PydanticObjectId) -> bool:
        """Reactivate a soft-deleted document."""
        db_obj = await self.get(id, include_inactive=True)
        if not db_obj:
            return False
        
        await db_obj.set({self.model.is_active: True, self.model.updated_at: datetime.utcnow()})
        return True

    async def delete(self, id: PydanticObjectId) -> bool:
        """Delete a document, ensuring it belongs to the current tenant."""
        db_obj = await self.get(id)
        if not db_obj:
            return False
            
        await db_obj.delete()
        return True

    def query(self):
        """Returns a Beanie find query pre-filtered by the current tenant ID."""
        return self.model.find(self.model.company_id == self._get_tenant_id())
