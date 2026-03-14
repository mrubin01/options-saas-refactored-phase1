import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.middleware.logging import request_id_ctx


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        request_id_ctx.set(request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
