from datetime import date
from typing import Literal

from sqlalchemy.orm import Session

from app.models.covered_call import CoveredCall


# API query layer


def _parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD


CoveredCallSortField = Literal[
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


COVERED_CALL_SORT_FIELDS = {
    "ticker": CoveredCall.ticker,
    "expiry_date": CoveredCall.expiry_date,
    "days_to_expiration": CoveredCall.days_to_expiration,
    "premium_per_contract": CoveredCall.premium_per_contract,
    "option_yield": CoveredCall.option_yield,
    "roc": CoveredCall.roc,
    "tot_return": CoveredCall.tot_return,
    "open_interest": CoveredCall.open_interest,
    "impl_volatility": CoveredCall.impl_volatility,
    "delta": CoveredCall.delta,
    "moneyness": CoveredCall.moneyness,
    "spread_bid_ask": CoveredCall.spread_bid_ask,
}


def _apply_min_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column >= value)


def _apply_max_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column <= value)


def get_covered_calls(
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
    sort_by: CoveredCallSortField | None = None,
    sort_dir: Literal["asc", "desc"] = "desc",

    # Pagination
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(CoveredCall)

    # Existing filters
    if exchange is not None:
        query = query.filter(CoveredCall.exchange == exchange)

    if contract is not None:
        query = query.filter(CoveredCall.contract == contract)

    if ticker is not None:
        query = query.filter(CoveredCall.ticker == ticker.upper())

    if min_expiry is not None:
        query = query.filter(CoveredCall.expiry_date >= _parse_date(min_expiry))

    # Categorical discovery filters
    if sector is not None:
        query = query.filter(CoveredCall.sector == sector)

    if industry is not None:
        query = query.filter(CoveredCall.industry == industry)

    # Stage 5.1 discovery range filters
    query = _apply_min_filter(
        query,
        CoveredCall.days_to_expiration,
        days_to_expiration_min,
    )
    query = _apply_max_filter(
        query,
        CoveredCall.days_to_expiration,
        days_to_expiration_max,
    )

    query = _apply_min_filter(query, CoveredCall.option_yield, option_yield_min)
    query = _apply_max_filter(query, CoveredCall.option_yield, option_yield_max)

    query = _apply_min_filter(query, CoveredCall.roc, roc_min)
    query = _apply_max_filter(query, CoveredCall.roc, roc_max)

    query = _apply_min_filter(query, CoveredCall.tot_return, tot_return_min)
    query = _apply_max_filter(query, CoveredCall.tot_return, tot_return_max)

    query = _apply_min_filter(
        query,
        CoveredCall.premium_per_contract,
        premium_per_contract_min,
    )
    query = _apply_max_filter(
        query,
        CoveredCall.premium_per_contract,
        premium_per_contract_max,
    )

    query = _apply_min_filter(query, CoveredCall.open_interest, open_interest_min)
    query = _apply_max_filter(query, CoveredCall.open_interest, open_interest_max)

    query = _apply_min_filter(
        query,
        CoveredCall.impl_volatility,
        impl_volatility_min,
    )
    query = _apply_max_filter(
        query,
        CoveredCall.impl_volatility,
        impl_volatility_max,
    )

    query = _apply_min_filter(query, CoveredCall.delta, delta_min)
    query = _apply_max_filter(query, CoveredCall.delta, delta_max)

    query = _apply_min_filter(query, CoveredCall.moneyness, moneyness_min)
    query = _apply_max_filter(query, CoveredCall.moneyness, moneyness_max)

    query = _apply_min_filter(
        query,
        CoveredCall.spread_bid_ask,
        spread_bid_ask_min,
    )
    query = _apply_max_filter(
        query,
        CoveredCall.spread_bid_ask,
        spread_bid_ask_max,
    )

    # Safe allowlisted sorting
    if sort_by is not None:
        sort_column = COVERED_CALL_SORT_FIELDS[sort_by]

        if sort_dir == "asc":
            query = query.order_by(sort_column.asc(), CoveredCall.contract.asc())
        else:
            query = query.order_by(sort_column.desc(), CoveredCall.contract.asc())
    else:
        query = query.order_by(
            CoveredCall.expiry_date.asc(),
            CoveredCall.contract.asc(),
        )

    return query.offset(offset).limit(limit).all()
