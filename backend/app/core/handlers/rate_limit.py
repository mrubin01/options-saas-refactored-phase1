from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.core.error_codes import ErrorCode
from app.core.response import fail
from app.core.serialize import serialize_model


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Standardize SlowAPI rate limit errors to ApiResponse envelope.
    Also tries to preserve retry headers when present.
    """
    request_id = getattr(request.state, "request_id", None)
    version = getattr(request.state, "api_version", None)
    if version is None:
        # fallback to URL-based detection
        path = request.url.path
        version = "v1" if path.startswith("/v1") else "v2" if path.startswith("/v2") else "unknown"

    # SlowAPI may attach headers on the exception; be defensive
    headers = {}
    exc_headers = getattr(exc, "headers", None)
    if isinstance(exc_headers, dict):
        headers.update(exc_headers)

    # Sometimes Retry-After is embedded in headers; keep if present
    payload = fail(
        code=str(ErrorCode.RATE_LIMITED),
        message="Rate limit exceeded",
        details={"detail": getattr(exc, "detail", "Too many requests")},
        request=request,
        version=version,
    )

    return JSONResponse(
        status_code=429,
        content=serialize_model(payload),
        headers=headers,
    )
