import time
from fastapi import Request, Response
from prometheus_client import (
    Counter,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "path"],
)


async def metrics_middleware(request: Request, call_next):
    start = time.time()

    response = await call_next(request)

    duration = time.time() - start

    path = request.url.path
    method = request.method
    status = response.status_code

    REQUEST_COUNT.labels(method, path, status).inc()
    REQUEST_LATENCY.labels(method, path).observe(duration)

    return response


def metrics_endpoint():
    return Response(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )
