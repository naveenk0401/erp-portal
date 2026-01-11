from typing import Generic, TypeVar, Type, List, Optional, Any, Dict
from beanie import Document, PydanticObjectId

T = TypeVar("T", bound=Document)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    async def get_by_id(self, id: Any) -> Optional[T]:
        if isinstance(id, str):
            id = PydanticObjectId(id)
        return await self.model.get(id)

    async def find_all(self) -> List[T]:
        return await self.model.find_all().to_list()

    async def find_one(self, criteria: Dict[str, Any]) -> Optional[T]:
        return await self.model.find_one(criteria)

    async def find_many(self, criteria: Dict[str, Any]) -> List[T]:
        return await self.model.find(criteria).to_list()

    async def create(self, entity: T) -> T:
        return await entity.insert()

    async def update(self, id: Any, update_data: Dict[str, Any]) -> Optional[T]:
        entity = await self.get_by_id(id)
        if entity:
            await entity.update({"$set": update_data})
            return entity
        return None

    async def delete(self, id: Any) -> bool:
        entity = await self.get_by_id(id)
        if entity:
            await entity.delete()
            return True
        return False
