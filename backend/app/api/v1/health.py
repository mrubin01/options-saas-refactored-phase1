from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session
import redis

from app.core.config import settings
from app.db.database import get_db

router = APIRouter(prefix="/internal", tags=["infra"])


@router.get("/health", include_in_schema=False)
def health():
    """
    Infra endpoints intentionally do NOT use ApiResponse envelope.
    Used for liveness/readiness probes.
    """
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready", include_in_schema=False)
def readiness(response: Response, db: Session = Depends(get_db)):
    """
    Infra endpoints intentionally do NOT use ApiResponse envelope.
    Used for liveness/readiness probes.
    """
    checks = {
        "database": False,
        "redis": False,
    }

    try:
        db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        checks["database"] = False

    try:
        client = redis.Redis.from_url(settings.REDIS_URL)
        client.ping()
        checks["redis"] = True
    except Exception:
        checks["redis"] = False

    ok = all(checks.values())

    if not ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if ok else "not_ready",
        "environment": settings.ENVIRONMENT,
        "checks": checks,
    }
