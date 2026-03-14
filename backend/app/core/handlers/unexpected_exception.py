import logging
from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.error_codes import ErrorCode
from app.schemas.api import ApiResponse, ApiError, ApiMeta
from app.core.middleware.request_context import get_request_id
from app.core.error_codes import ErrorCode  # your registry
from typing import cast
from fastapi.encoders import jsonable_encoder

logger = logging.getLogger("app.crash")


def _unwrap_exception(exc: BaseException) -> BaseException:
    # Python 3.11: ExceptionGroup / BaseExceptionGroup
    sub = getattr(exc, "exceptions", None)
    if sub and isinstance(sub, list) and len(sub) > 0:
        return cast(BaseException, sub[0])
    return exc


async def unexpected_exception_handler(request: Request, exc: Exception):
    root = _unwrap_exception(exc)

    request_id = getattr(request.state, "request_id", None)
    version = getattr(request.state, "api_version", None)

    logger.exception(
        "UNHANDLED_EXCEPTION",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "exc_type": type(root).__name__,
        },
    )

    resp = ApiResponse(
        success=False,
        data=None,
        error=ApiError(
            code=str(ErrorCode.INTERNAL_ERROR),
            message="Unexpected server error",
            details={"type": type(root).__name__, "message": str(root)},
            request_id=request_id,
        ),
        meta=ApiMeta(
            request_id=request_id,
            version=version or ("v1" if request.url.path.startswith("/v1") else "v2" if request.url.path.startswith("/v2") else "unknown"),
        ),
    )

    return JSONResponse(status_code=500, content=jsonable_encoder(resp))


