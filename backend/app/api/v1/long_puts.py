from typing import List, Literal

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import distinct
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.cache import cache_key_builder
from app.core.rate_limit import limiter
from app.core.response import ok
from app.db.database import get_db
from app.models.long_put import LongPut
from app.models.user import User
from app.schemas.api import ApiResponse, PaginationMeta
from app.schemas.v1.long_put import LongPutOut, LongPutSortField
from app.services.long_puts import get_long_puts
from fastapi_cache.decorator import cache

router = APIRouter(tags=["long-puts"])


@router.get("/expiry-dates", response_model=ApiResponse[list[str]])
@limiter.limit("30/minute")
@cache(expire=300, key_builder=cache_key_builder, namespace="v1:long_puts:expiry_dates")
async def list_long_puts_expiry_dates(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dates = (
        db.query(distinct(LongPut.expiry_date))
        .order_by(LongPut.expiry_date.asc())
        .all()
    )
    return ok(data=[str(row[0]) for row in dates], request=request)


@router.get("", response_model=ApiResponse[List[LongPutOut]])
@limiter.limit("30/minute")
@cache(expire=30, key_builder=cache_key_builder, namespace="v1:long_puts")
async def list_long_puts(
    request: Request,

    exchange: int | None = Query(default=None),
    ticker: str | None = Query(default=None, min_length=1, max_length=20),
    contract: str | None = Query(default=None, min_length=1, max_length=100),
    expiry_date: str | None = Query(default=None, description="Exact expiry date (YYYY-MM-DD)."),
    min_expiry: str | None = Query(default=None, description="Minimum expiry date (>=). Ignored when expiry_date is set."),

    days_to_expiration_min: int | None = Query(default=None, ge=0),
    days_to_expiration_max: int | None = Query(default=None, ge=0),
    premium_per_contract_min: float | None = Query(default=None, ge=0),
    premium_per_contract_max: float | None = Query(default=None, ge=0),
    open_interest_min: int | None = Query(default=None, ge=0),
    open_interest_max: int | None = Query(default=None, ge=0),
    impl_volatility_min: float | None = Query(default=None, ge=0),
    impl_volatility_max: float | None = Query(default=None, ge=0),
    delta_min: float | None = Query(default=None),
    delta_max: float | None = Query(default=None),
    moneyness_min: float | None = Query(default=None),
    moneyness_max: float | None = Query(default=None),
    spread_bid_ask_min: float | None = Query(default=None, ge=0),
    spread_bid_ask_max: float | None = Query(default=None, ge=0),
    iv_hv_ratio_min: float | None = Query(default=None, ge=0),
    iv_hv_ratio_max: float | None = Query(default=None, ge=0),
    return_5pct_min: float | None = Query(default=None),
    return_5pct_max: float | None = Query(default=None),
    return_10pct_min: float | None = Query(default=None),
    return_10pct_max: float | None = Query(default=None),

    main_trend: int | None = Query(default=None, description="0=Sideways, 1=Uptrend, -1=Downtrend"),
    sector: str | None = Query(default=None, min_length=1, max_length=100),
    industry: str | None = Query(default=None, min_length=1, max_length=150),

    sort_by: LongPutSortField | None = Query(default=None),
    sort_dir: Literal["asc", "desc"] = Query(default="asc"),

    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data, total = get_long_puts(
        db=db,
        exchange=exchange,
        ticker=ticker,
        contract=contract,
        expiry_date=expiry_date,
        min_expiry=min_expiry,
        days_to_expiration_min=days_to_expiration_min,
        days_to_expiration_max=days_to_expiration_max,
        premium_per_contract_min=premium_per_contract_min,
        premium_per_contract_max=premium_per_contract_max,
        open_interest_min=open_interest_min,
        open_interest_max=open_interest_max,
        impl_volatility_min=impl_volatility_min,
        impl_volatility_max=impl_volatility_max,
        delta_min=delta_min,
        delta_max=delta_max,
        moneyness_min=moneyness_min,
        moneyness_max=moneyness_max,
        spread_bid_ask_min=spread_bid_ask_min,
        spread_bid_ask_max=spread_bid_ask_max,
        iv_hv_ratio_min=iv_hv_ratio_min,
        iv_hv_ratio_max=iv_hv_ratio_max,
        return_5pct_min=return_5pct_min,
        return_5pct_max=return_5pct_max,
        return_10pct_min=return_10pct_min,
        return_10pct_max=return_10pct_max,
        main_trend=main_trend,
        sector=sector,
        industry=industry,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )

    return ok(
        data=data,
        request=request,
        pagination=PaginationMeta(
            limit=limit,
            offset=offset,
            total=total,
            has_next=(offset + limit) < total,
        ),
    )
