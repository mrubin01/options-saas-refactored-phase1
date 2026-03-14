from app.schemas.api import ApiResponse, ApiMeta, ApiError
from fastapi import Request

from fastapi import Request
from app.schemas.api import ApiResponse, ApiMeta, PaginationMeta


def ok(*, data, request: Request | None = None, version: str | None = None, pagination: PaginationMeta | None = None):
    resolved_version: str

    if version is not None:
        resolved_version = version
    elif request is not None:
        path = request.url.path.lstrip("/")
        resolved_version = path.split("/")[0] if "/" in path else "unknown"
    else:
        resolved_version = "unknown"

    return ApiResponse(
        success=True,
        data=data,
        error=None,
        meta=ApiMeta(
            request_id=getattr(request.state, "request_id", None) if request else None,
            version=resolved_version,
            pagination=pagination,
        ),
    )


def fail(*, 
         code: str, 
         message: str, 
         request: Request | None = None, 
         request_id: str | None = None,
         details: dict | None = None, 
         version: str = "v1"):

    rid = request_id or (getattr(request.state, "request_id", None) if request else None)

    resolved_version = version
    if resolved_version is None and request is not None:
        path = request.url.path.lstrip("/")
        resolved_version = path.split("/")[0] if "/" in path else "unknown"
    if resolved_version is None:
        resolved_version = "unknown"

    return ApiResponse(
        success=False,
        data=None,
        error=ApiError(code=code, message=message, details=details, request_id=rid),
        meta=ApiMeta(request_id=rid, version=resolved_version),
    )
