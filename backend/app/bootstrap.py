from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import router as v1_router
from app.api.v2.router import router as v2_router
from app.core.config import settings
from app.core.exceptions import app_exception_handler, validation_exception_handler, AppException
from app.core.handlers.rate_limit import rate_limit_exceeded_handler
from app.core.handlers.unexpected_exception import unexpected_exception_handler
from app.core.middleware.headers import VersionHeadersMiddleware, DeprecationHeadersMiddleware
from app.core.middleware.no_cache import NoCacheAuthMiddleware
from app.core.middleware.request_id import RequestIdMiddleware
from app.core.middleware.unwrap_exception_group import UnwrapExceptionGroupMiddleware
from app.core.rate_limit import limiter


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unexpected_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


def register_middleware(app: FastAPI) -> None:
    cors_origins = settings.CORS_ORIGINS
    allowed_origins = [o.strip() for o in cors_origins.split(",") if o.strip()]

    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(NoCacheAuthMiddleware)
    app.add_middleware(DeprecationHeadersMiddleware)
    app.add_middleware(VersionHeadersMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(UnwrapExceptionGroupMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def register_routers(app: FastAPI) -> None:
    app.include_router(v1_router, prefix="/v1")
    app.include_router(v2_router, prefix="/v2")


def configure_app(app: FastAPI) -> FastAPI:
    app.state.limiter = limiter
    register_exception_handlers(app)
    register_middleware(app)
    register_routers(app)
    return app
