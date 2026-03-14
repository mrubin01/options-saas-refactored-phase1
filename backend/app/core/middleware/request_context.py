import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from contextvars import ContextVar

request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)


def get_request_id() -> str | None:
    return request_id_ctx.get()


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = uuid.uuid4().hex[:12]
        request_id_ctx.set(request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

