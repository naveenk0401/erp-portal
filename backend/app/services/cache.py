import time
from typing import Set, Dict, Optional, Any

class PermissionCache:
    """
    In-memory cache for user permissions.
    Designed to be easily replaceable with Redis.
    """
    _instance: Optional['PermissionCache'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PermissionCache, cls).__new__(cls)
            cls._instance._cache: Dict[str, Dict[str, Any]] = {}
            cls._instance._ttl = 300  # 5 minutes default
        return cls._instance

    def _get_key(self, user_id: str, company_id: str) -> str:
        return f"perm_cache:{user_id}:{company_id}"

    def get_permissions(self, user_id: str, company_id: str) -> Optional[Set[str]]:
        key = self._get_key(user_id, company_id)
        entry = self._cache.get(key)
        
        if not entry:
            return None
            
        if time.time() > entry['expiry']:
            del self._cache[key]
            return None
            
        print(f"CACHE HIT: Permissions for user {user_id} in company {company_id}")
        return entry['permissions']

    def set_permissions(self, user_id: str, company_id: str, permissions: Set[str]):
        key = self._get_key(user_id, company_id)
        self._cache[key] = {
            'permissions': permissions,
            'expiry': time.time() + self._ttl
        }
        print(f"CACHE SET: Permissions for user {user_id} in company {company_id}")

    def invalidate(self, user_id: str, company_id: Optional[str] = None):
        """
        Invalidate cache for a specific user.
        If company_id is provided, only that specific context is cleared.
        If company_id is None, all company contexts for that user are cleared.
        """
        if company_id:
            key = self._get_key(user_id, company_id)
            if key in self._cache:
                del self._cache[key]
                print(f"CACHE INVALIDATE: Key {key}")
        else:
            # Clear all keys for this user
            prefix = f"perm_cache:{user_id}:"
            keys_to_del = [k for k in self._cache.keys() if k.startswith(prefix)]
            for k in keys_to_del:
                del self._cache[k]
                print(f"CACHE INVALIDATE: Key {k}")

    def invalidate_all_for_company(self, company_id: str):
        """
        Clear cache for ALL users in a specific company.
        Useful when a Role is updated.
        """
        suffix = f":{company_id}"
        keys_to_del = [k for k in self._cache.keys() if k.endswith(suffix)]
        for k in keys_to_del:
            del self._cache[k]
            print(f"CACHE INVALIDATE ALL: Company {company_id}")

# Global singleton instance
permission_cache = PermissionCache()
