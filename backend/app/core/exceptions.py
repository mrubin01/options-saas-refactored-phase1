from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_500_INTERNAL_SERVER_ERROR
from app.core.response import fail
from app.core.serialize import serialize_model
from app.core.error_codes import ErrorCode
from typing import Any, Dict, Optional
from app.schemas.api import ApiResponse, ApiError, ApiMeta
from app.core.errors.validation import format_validation_errors
from fastapi.encoders import jsonable_encoder

class AppException(Exception):
    def __init__(
        self,
        code: str,
        status_code: int,
        message: str,
        details: dict | None = None,
    ):
        self.code = code
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(message)


async def app_exception_handler(request: Request, exc: AppException):
    payload = fail(
        code=str(exc.code),
        message=exc.message,
        details=getattr(exc, "details", None),
        request=request,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=serialize_model(payload),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)

    details = format_validation_errors(exc)

    response = ApiResponse(
        success=False,
        data=None,
        error=ApiError(
            code="VALIDATION_ERROR",
            message="Invalid request",
            details={"errors": details},
            request_id=request_id,
        ),
        meta=ApiMeta(
            request_id=request_id,
            version=getattr(request.state, "api_version", "v1"),
        ),
    )

    return JSONResponse(
        status_code=422,
        # content=response.dict() 
        content=jsonable_encoder(response),
    )

# This has been replaced by a more standardized version.   
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     return JSONResponse(
#         status_code=422,
#         content=fail(
#             code=str(ErrorCode.VALIDATION_ERROR),
#             message="Request validation failed",
#             details={"errors": exc.errors()},
#             request=request,
#         ).dict(),
#     )

# This has been replaced by a standardized unexpected_exception_handler in app/core/handlers/unexpected_exception.py
# async def unhandled_exception_handler(request: Request, exc: Exception):
#     payload = fail(
#         code="INTERNAL_ERROR",
#         message="Unexpected server error",
#         request=request,
#     )
#     return JSONResponse(
#         status_code=HTTP_500_INTERNAL_SERVER_ERROR,
#         content=serialize_model(payload),
#     )
