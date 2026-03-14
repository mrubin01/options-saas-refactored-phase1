from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

from app.bootstrap import configure_app
from app.core.config import settings
from app.core.middleware.logging import setup_logging
from app.core.middleware.request_logging import logging_middleware
from app.core.middleware.metrics import metrics_middleware
from app.core.middleware.version import version_middleware
from app.core.sentry import init_sentry

setup_logging()
init_sentry()

app = configure_app(
    FastAPI(
        title="Options Analytics API",
        version="1.0.0",
    )
)

app.middleware("http")(logging_middleware)
app.middleware("http")(metrics_middleware)
app.middleware("http")(version_middleware)


@app.on_event("startup")
def startup_checks():
    import app.api.v1.auth  # noqa: F401
    import app.core.middleware.logging  # noqa: F401
    import app.core.middleware.metrics  # noqa: F401


@app.get("/", include_in_schema=False)
def root():
    return {"status": "backend is running"}


@app.on_event("startup")
async def startup_cache():
    try:
        import redis.asyncio as redis
        from fastapi_cache.backends.redis import RedisBackend

        client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=False)
        await client.ping()
        FastAPICache.init(RedisBackend(client), prefix="options-saas")
    except Exception:
        FastAPICache.init(InMemoryBackend(), prefix="options-saas")
