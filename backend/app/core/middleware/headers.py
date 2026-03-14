from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class VersionHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if path.startswith("/v1"):
            response.headers["X-API-Version"] = "v1"
        elif path.startswith("/v2"):
            response.headers["X-API-Version"] = "v2"
        return response


class DeprecationHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/v1"):
            response.headers["X-API-Deprecated"] = "false"
        return response
