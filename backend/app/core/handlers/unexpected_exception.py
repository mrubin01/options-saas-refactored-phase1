from fastapi import Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.middleware.logging import get_logger
from app.core.response import fail
from app.core.error_codes import ErrorCode

logger = get_logger(__name__)


async def unexpected_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)

    logger.exception(
        "Unhandled exception",
        extra={
            "request_id": request_id,
            "path": str(request.url.path),
            "method": request.method,
        },
    )

    if settings.ENVIRONMENT == "local":
        message = f"{exc.__class__.__name__}: {str(exc)}"
        details = {"exception_type": exc.__class__.__name__}
    else:
        message = "An unexpected error occurred."
        details = None

    body = fail(
        request=request,
        code=ErrorCode.INTERNAL_ERROR,
        message=message,
        details=details,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=jsonable_encoder(body),
    )
