from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db

router = APIRouter(prefix="/internal", tags=["infra"])


@router.get("/health", include_in_schema=False)
def health():
    """
    Infra endpoints intentionally do NOT use ApiResponse envelope.
    Used for liveness/readiness probes.

    Liveness probe.
    Returns OK if the app is running.
    """
    return {"status": "ok"}


@router.get("/ready", include_in_schema=False)
def readiness(db: Session = Depends(get_db)):
    """
    Infra endpoints intentionally do NOT use ApiResponse envelope.
    Used for liveness/readiness probes.

    Readiness probe.
    Returns OK if DB is reachable.
    """
    db.execute(text("SELECT 1"))
    return {"status": "ready"}

