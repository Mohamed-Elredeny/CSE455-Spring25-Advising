import json
import os
from typing import Any, Optional
import redis
from functools import wraps

# Initialize Redis client
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

def get_cache_ttl() -> int:
    """Get cache TTL from environment variables."""
    return int(os.getenv("CACHE_TTL", 3600))

def is_cache_enabled() -> bool:
    """Check if caching is enabled."""
    return os.getenv("CACHE_ENABLED", "true").lower() == "true"

def cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from prefix and arguments."""
    key_parts = [prefix]
    if args:
        key_parts.extend(str(arg) for arg in args)
    if kwargs:
        key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
    return ":".join(key_parts)

def cached(ttl: Optional[int] = None):
    """
    Decorator for caching function results.
    
    Args:
        ttl: Time-to-live in seconds. If None, uses default from environment.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not is_cache_enabled():
                return await func(*args, **kwargs)
                
            key = cache_key(func.__name__, *args, **kwargs)
            cached_value = redis_client.get(key)
            
            if cached_value is not None:
                return json.loads(cached_value)
                
            result = await func(*args, **kwargs)
            redis_client.setex(
                key,
                ttl or get_cache_ttl(),
                json.dumps(result)
            )
            return result
        return wrapper
    return decorator

def invalidate_cache(prefix: str):
    """
    Invalidate all cache entries with the given prefix.
    
    Args:
        prefix: The prefix of cache keys to invalidate.
    """
    if not is_cache_enabled():
        return
        
    keys = redis_client.keys(f"{prefix}:*")
    if keys:
        redis_client.delete(*keys) 