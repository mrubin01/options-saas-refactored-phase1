from sqlalchemy.orm import Session
from app.models.spread_option import SpreadOption
from datetime import date
from typing import Literal

# API query layer  

def _parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD

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

SPREAD_OPTION_SORT_FIELDS = {
    "ticker": SpreadOption.ticker,
    "expiry_date": SpreadOption.expiry_date,
    "days_to_expiration": SpreadOption.days_to_expiration,
    "premium_per_contract": SpreadOption.premium_per_contract,
    "option_yield": SpreadOption.option_yield,
    "roc": SpreadOption.roc,
    "tot_return": SpreadOption.tot_return,
    "open_interest": SpreadOption.open_interest,
    "impl_volatility": SpreadOption.impl_volatility,
    "delta": SpreadOption.delta,
    "moneyness": SpreadOption.moneyness,
    "spread_bid_ask": SpreadOption.spread_bid_ask,
}

def _apply_min_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column >= value)


def _apply_max_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column <= value)

def get_spread_options(
    db: Session,
    exchange: int | None = None,
    ticker: str | None = None,
    contract: str | None = None,
    min_expiry: str | None = None,

    # Stage 5.1 discovery filters
    days_to_expiration_min: int | None = None,
    days_to_expiration_max: int | None = None,
    option_yield_min: float | None = None,
    option_yield_max: float | None = None,
    roc_min: float | None = None,
    roc_max: float | None = None,
    tot_return_min: float | None = None,
    tot_return_max: float | None = None,
    premium_per_contract_min: float | None = None,
    premium_per_contract_max: float | None = None,
    open_interest_min: int | None = None,
    open_interest_max: int | None = None,
    impl_volatility_min: float | None = None,
    impl_volatility_max: float | None = None,
    delta_min: float | None = None,
    delta_max: float | None = None,
    moneyness_min: float | None = None,
    moneyness_max: float | None = None,
    spread_bid_ask_min: float | None = None,
    spread_bid_ask_max: float | None = None,

    # Categorical filters
    sector: str | None = None,
    industry: str | None = None,

    # Sorting
    sort_by: SpreadOptionSortField | None = None,
    sort_dir: Literal["asc", "desc"] = "desc",

    # Pagination
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(SpreadOption)

    # Existing filters
    if exchange is not None:
        query = query.filter(SpreadOption.exchange == exchange)

    if contract is not None:
        query = query.filter(SpreadOption.contract == contract)

    if ticker is not None:
        query = query.filter(SpreadOption.ticker == ticker.upper())

    if min_expiry is not None:
        query = query.filter(SpreadOption.expiry_date >= _parse_date(min_expiry))

    # Categorical discovery filters
    if sector is not None:
        query = query.filter(SpreadOption.sector == sector)

    if industry is not None:
        query = query.filter(SpreadOption.industry == industry)

    # Stage 5.1 discovery range filters
    query = _apply_min_filter(
        query,
        SpreadOption.days_to_expiration,
        days_to_expiration_min,
    )
    query = _apply_max_filter(
        query,
        SpreadOption.days_to_expiration,
        days_to_expiration_max,
    )

    query = _apply_min_filter(query, SpreadOption.option_yield, option_yield_min)
    query = _apply_max_filter(query, SpreadOption.option_yield, option_yield_max)

    query = _apply_min_filter(query, SpreadOption.roc, roc_min)
    query = _apply_max_filter(query, SpreadOption.roc, roc_max)

    query = _apply_min_filter(query, SpreadOption.tot_return, tot_return_min)
    query = _apply_max_filter(query, SpreadOption.tot_return, tot_return_max)

    query = _apply_min_filter(
        query,
        SpreadOption.premium_per_contract,
        premium_per_contract_min,
    )
    query = _apply_max_filter(
        query,
        SpreadOption.premium_per_contract,
        premium_per_contract_max,
    )

    query = _apply_min_filter(query, SpreadOption.open_interest, open_interest_min)
    query = _apply_max_filter(query, SpreadOption.open_interest, open_interest_max)

    query = _apply_min_filter(
        query,
        SpreadOption.impl_volatility,
        impl_volatility_min,
    )
    query = _apply_max_filter(
        query,
        SpreadOption.impl_volatility,
        impl_volatility_max,
    )

    query = _apply_min_filter(query, SpreadOption.delta, delta_min)
    query = _apply_max_filter(query, SpreadOption.delta, delta_max)

    query = _apply_min_filter(query, SpreadOption.moneyness, moneyness_min)
    query = _apply_max_filter(query, SpreadOption.moneyness, moneyness_max)

    query = _apply_min_filter(
        query,
        SpreadOption.spread_bid_ask,
        spread_bid_ask_min,
    )
    query = _apply_max_filter(
        query,
        SpreadOption.spread_bid_ask,
        spread_bid_ask_max,
    )

    # Safe allowlisted sorting
    if sort_by is not None:
        sort_column = SPREAD_OPTION_SORT_FIELDS[sort_by]

        if sort_dir == "asc":
            query = query.order_by(sort_column.asc(), SpreadOption.contract.asc())
        else:
            query = query.order_by(sort_column.desc(), SpreadOption.contract.asc())
    else:
        query = query.order_by(
            SpreadOption.expiry_date.asc(),
            SpreadOption.contract.asc(),
        )

    return query.offset(offset).limit(limit).all()
