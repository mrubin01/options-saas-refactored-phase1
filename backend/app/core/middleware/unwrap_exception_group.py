from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class UnwrapExceptionGroupMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except BaseExceptionGroup as eg:  # Python 3.11
            # Raise the first underlying exception so FastAPI handlers can catch it
            first = eg.exceptions[0] if eg.exceptions else eg
            # Make sure we re-raise an Exception (not BaseException)
            if isinstance(first, Exception):
                raise first
            raise RuntimeError(str(first)) from first

