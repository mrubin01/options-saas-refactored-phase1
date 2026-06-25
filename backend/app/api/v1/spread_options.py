from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.response import ok
from fastapi import Request
from app.db.database import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.schemas.v1.spread_option import SpreadOptionOut, SpreadOptionList
from app.services.spread_options import get_spread_options
from app.schemas.api import ApiResponse, PaginationMeta
from app.core.rate_limit import limiter
from fastapi_cache.decorator import cache
from app.core.cache import cache_key_builder
from typing import Literal

# this router handles filtering, pagination, and retrieval of spread options

router = APIRouter(tags=["spread-options"])

SpreadOptionSortField = Literal[
    "ticker",
    "expiry_date",
    "days_to_expiration",
    "premium_per_contract",
    "option_yield",
    "roc",
    "tot_return",
    "open_interest",
    "impl_volatility",
    "delta",
    "moneyness",
    "spread_bid_ask",
]

@router.get("", response_model=ApiResponse[List[SpreadOptionOut]])
@limiter.limit("30/minute")
@cache(expire=30, key_builder=cache_key_builder, namespace="v1:spread-options")
async def list_spread_options(
    request: Request,

    # Existing filters
    exchange: int | None = Query(
        default=None,
        description="Exchange identifier.",
    ),
    ticker: str | None = Query(
        default=None,
        min_length=1,
        max_length=20,
        description="Filter by underlying ticker symbol.",
    ),
    contract: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
        description="Filter by option contract symbol.",
    ),
    min_expiry: str | None = Query(
        default=None,
        description="Filter by minimum expiry date. Existing format preserved.",
    ),

    # Stage 5.1 discovery filters
    days_to_expiration_min: int | None = Query(
        default=None,
        ge=0,
        description="Minimum days to expiration.",
    ),
    days_to_expiration_max: int | None = Query(
        default=None,
        ge=0,
        description="Maximum days to expiration.",
    ),

    option_yield_min: float | None = Query(
        default=None,
        description="Minimum spread option yield.",
    ),
    option_yield_max: float | None = Query(
        default=None,
        description="Maximum spread option yield.",
    ),

    roc_min: float | None = Query(
        default=None,
        description="Minimum return on capital.",
    ),
    roc_max: float | None = Query(
        default=None,
        description="Maximum return on capital.",
    ),

    tot_return_min: float | None = Query(
        default=None,
        description="Minimum total return.",
    ),
    tot_return_max: float | None = Query(
        default=None,
        description="Maximum total return.",
    ),

    premium_per_contract_min: float | None = Query(
        default=None,
        ge=0,
        description="Minimum option premium per contract.",
    ),
    premium_per_contract_max: float | None = Query(
        default=None,
        ge=0,
        description="Maximum option premium per contract.",
    ),

    open_interest_min: int | None = Query(
        default=None,
        ge=0,
        description="Minimum open interest.",
    ),
    open_interest_max: int | None = Query(
        default=None,
        ge=0,
        description="Maximum open interest.",
    ),

    impl_volatility_min: float | None = Query(
        default=None,
        ge=0,
        description="Minimum implied volatility.",
    ),
    impl_volatility_max: float | None = Query(
        default=None,
        ge=0,
        description="Maximum implied volatility.",
    ),

    delta_min: float | None = Query(
        default=None,
        description="Minimum delta.",
    ),
    delta_max: float | None = Query(
        default=None,
        description="Maximum delta.",
    ),

    moneyness_min: float | None = Query(
        default=None,
        description="Minimum moneyness.",
    ),
    moneyness_max: float | None = Query(
        default=None,
        description="Maximum moneyness.",
    ),

    spread_bid_ask_min: float | None = Query(
        default=None,
        ge=0,
        description="Minimum bid/ask spread.",
    ),
    spread_bid_ask_max: float | None = Query(
        default=None,
        ge=0,
        description="Maximum bid/ask spread.",
    ),

    # Categorical filters
    main_trend: int | None = Query(
        default=None,
        description="Filter by trend (0=Sideways, 1=Uptrend, -1=Downtrend).",
    ),
    sector: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
        description="Filter by sector.",
    ),
    industry: str | None = Query(
        default=None,
        min_length=1,
        max_length=150,
        description="Filter by industry.",
    ),

    # Safe sorting
    sort_by: SpreadOptionSortField | None = Query(
        default=None,
        description="Field to sort by.",
    ),
    sort_dir: Literal["asc", "desc"] = Query(
        default="desc",
        description="Sort direction.",
    ),

    # Pagination
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
        description="Maximum number of rows to return.",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of rows to skip.",
    ),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a list of spread options with Stage 5.1 discovery filters.

    Supports:
    - existing basic filters
    - numeric range filters
    - categorical filters
    - safe allowlisted sorting
    - pagination
    """
    spread_options, total = get_spread_options(
        db=db,
        exchange=exchange,
        ticker=ticker,
        contract=contract,
        min_expiry=min_expiry,
        days_to_expiration_min=days_to_expiration_min,
        days_to_expiration_max=days_to_expiration_max,
        option_yield_min=option_yield_min,
        option_yield_max=option_yield_max,
        roc_min=roc_min,
        roc_max=roc_max,
        tot_return_min=tot_return_min,
        tot_return_max=tot_return_max,
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
        main_trend=main_trend,
        sector=sector,
        industry=industry,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )

    return ok(
        data=spread_options,
        request=request,
        pagination=PaginationMeta(
            limit=limit,
            offset=offset,
            total=total,
            has_next=(offset + limit) < total,
        ),
    )
