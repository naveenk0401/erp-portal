from typing import Generic, TypeVar, Type
from app.repositories.base_repo import BaseRepository

T = TypeVar("T")

class BaseService(Generic[T]):
    def __init__(self, repository: BaseRepository):
        self.repository = repository

    # Standard service methods can be added here
    # Services should focus on business logic and call repositories for data access
