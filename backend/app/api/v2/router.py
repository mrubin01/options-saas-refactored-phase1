from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.covered_calls import router as covered_calls_router
from app.api.v1.put_options import router as put_options_router
from app.api.v1.spread_options import router as spread_options_router
from app.api.v1 import metrics, health

router = APIRouter(
    prefix="/v2", 
    tags=["v2"]
)
