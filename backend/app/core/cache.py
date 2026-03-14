import hashlib
from fastapi import Request

def cache_key_builder(func, namespace: str = "", request: Request | None = None, *args, **kwargs) -> str:
    """
    Cache key based on:
    - namespace
    - request path
    - sorted query params
    - (optional) user id for user-scoped endpoints
    """
    if request is None:
        # fallback: stable key from func name + kwargs
        raw = f"{namespace}:{func.__module__}.{func.__name__}:{sorted(kwargs.items())}"
        return hashlib.sha256(raw.encode()).hexdigest()

    qp = "&".join(f"{k}={v}" for k, v in sorted(request.query_params.items()))
    raw = f"{namespace}:{request.url.path}?{qp}"

    # If you ever cache user-specific endpoints, add:
    # user_id = getattr(getattr(request.state, "user", None), "id", None)
    # raw += f":user={user_id}"

    return hashlib.sha256(raw.encode()).hexdigest()
