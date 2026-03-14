from starlette.middleware.base import BaseHTTPMiddleware

class NoCacheAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        if request.url.path.startswith("/v1/auth") or request.url.path.startswith("/v2/auth"):
            response.headers["Cache-Control"] = "no-store"
            response.headers["Pragma"] = "no-cache"

        return response
