from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.response import ok
from fastapi import Request
from app.db.database import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.schemas.v1.put_option import PutOptionOut, PutOptionList
from app.services.put_options import get_put_options
from app.schemas.api import ApiResponse
from app.core.rate_limit import limiter
from fastapi_cache.decorator import cache
from app.core.cache import cache_key_builder

# this router handles filtering, pagination, and retrieval of put options

router = APIRouter(tags=["put-options"])

@router.get("", response_model=ApiResponse[List[PutOptionOut]])
@limiter.limit("30/minute")
@cache(expire=30, key_builder=cache_key_builder, namespace="v1:put_options")
async def list_put_options(
    request: Request,
    exchange: int | None = Query(None),
    ticker: str | None = Query(None),
    contract: str | None = Query(None),
    min_expiry: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a list of put options with filters.
    """
    put_options = get_put_options(
        db=db,
        exchange=exchange,
        ticker=ticker,
        contract=contract,
        min_expiry=min_expiry,
        limit=limit,
        offset=offset,
    )

    return ok(
        data=put_options,
        request=request,
    )

