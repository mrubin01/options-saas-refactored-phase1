from fastapi import APIRouter

from app.api.v1 import auth
from app.api.v1 import covered_calls
from app.api.v1 import put_options

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(covered_calls.router, prefix="/covered-calls", tags=["covered-calls"])
router.include_router(put_options.router, prefix="/put-options", tags=["put-options"])
