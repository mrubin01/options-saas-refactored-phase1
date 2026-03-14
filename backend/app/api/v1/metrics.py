from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from app.schemas.api import ApiResponse

router = APIRouter(prefix="/internal", tags=["infra"])

@router.get("/metrics", include_in_schema=False, response_class=PlainTextResponse)
def metrics():
    """
    Infra endpoints intentionally do NOT use ApiResponse envelope.
    Used for liveness/readiness probes.
    """
    return generate_latest()
