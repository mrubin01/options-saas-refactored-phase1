from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.covered_calls import router as covered_calls_router
from app.api.v1.data_freshness import router as data_freshness_router
from app.api.v1.exchanges import router as exchanges_router
from app.api.v1.put_options import router as put_options_router
from app.api.v1.long_calls import router as long_calls_router
from app.api.v1.long_puts import router as long_puts_router
from app.api.v1 import metrics, health
from app.api.v1.saved_screeners import router as saved_screeners_router
from app.api.v1.watchlist import router as watchlist_router
from app.api.v1.ingestion_status import router as ingestion_status_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(covered_calls_router, prefix="/covered-calls", tags=["covered-calls"])
router.include_router(put_options_router, prefix="/put-options", tags=["put-options"])
router.include_router(long_calls_router, prefix="/long-calls", tags=["long-calls"])
router.include_router(long_puts_router, prefix="/long-puts", tags=["long-puts"])
router.include_router(exchanges_router)
router.include_router(data_freshness_router)
router.include_router(metrics.router)
router.include_router(health.router)
router.include_router(saved_screeners_router)
router.include_router(watchlist_router)
router.include_router(ingestion_status_router)
