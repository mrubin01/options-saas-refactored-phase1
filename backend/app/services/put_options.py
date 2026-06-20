from sqlalchemy.orm import Session
from app.models.put_option import PutOption
from datetime import date
from typing import Literal

# API query layer  

def _parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD

PutOptionSortField = Literal[
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

PUT_OPTION_SORT_FIELDS = {
    "ticker": PutOption.ticker,
    "expiry_date": PutOption.expiry_date,
    "days_to_expiration": PutOption.days_to_expiration,
    "premium_per_contract": PutOption.premium_per_contract,
    "option_yield": PutOption.option_yield,
    "roc": PutOption.roc,
    "tot_return": PutOption.tot_return,
    "open_interest": PutOption.open_interest,
    "impl_volatility": PutOption.impl_volatility,
    "delta": PutOption.delta,
    "moneyness": PutOption.moneyness,
    "spread_bid_ask": PutOption.spread_bid_ask,
}

def _apply_min_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column >= value)


def _apply_max_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column <= value)

def get_put_options(
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
    sort_by: PutOptionSortField | None = None,
    sort_dir: Literal["asc", "desc"] = "desc",

    # Pagination
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(PutOption)

    # Existing filters
    if exchange is not None:
        query = query.filter(PutOption.exchange == exchange)

    if contract is not None:
        query = query.filter(PutOption.contract == contract)

    if ticker is not None:
        query = query.filter(PutOption.ticker == ticker.upper())

    if min_expiry is not None:
        query = query.filter(PutOption.expiry_date >= _parse_date(min_expiry))

    # Categorical discovery filters
    if sector is not None:
        query = query.filter(PutOption.sector == sector)

    if industry is not None:
        query = query.filter(PutOption.industry == industry)

    # Stage 5.1 discovery range filters
    query = _apply_min_filter(
        query,
        PutOption.days_to_expiration,
        days_to_expiration_min,
    )
    query = _apply_max_filter(
        query,
        PutOption.days_to_expiration,
        days_to_expiration_max,
    )

    query = _apply_min_filter(query, PutOption.option_yield, option_yield_min)
    query = _apply_max_filter(query, PutOption.option_yield, option_yield_max)

    query = _apply_min_filter(query, PutOption.roc, roc_min)
    query = _apply_max_filter(query, PutOption.roc, roc_max)

    query = _apply_min_filter(query, PutOption.tot_return, tot_return_min)
    query = _apply_max_filter(query, PutOption.tot_return, tot_return_max)

    query = _apply_min_filter(
        query,
        PutOption.premium_per_contract,
        premium_per_contract_min,
    )
    query = _apply_max_filter(
        query,
        PutOption.premium_per_contract,
        premium_per_contract_max,
    )

    query = _apply_min_filter(query, PutOption.open_interest, open_interest_min)
    query = _apply_max_filter(query, PutOption.open_interest, open_interest_max)

    query = _apply_min_filter(
        query,
        PutOption.impl_volatility,
        impl_volatility_min,
    )
    query = _apply_max_filter(
        query,
        PutOption.impl_volatility,
        impl_volatility_max,
    )

    query = _apply_min_filter(query, PutOption.delta, delta_min)
    query = _apply_max_filter(query, PutOption.delta, delta_max)

    query = _apply_min_filter(query, PutOption.moneyness, moneyness_min)
    query = _apply_max_filter(query, PutOption.moneyness, moneyness_max)

    query = _apply_min_filter(
        query,
        PutOption.spread_bid_ask,
        spread_bid_ask_min,
    )
    query = _apply_max_filter(
        query,
        PutOption.spread_bid_ask,
        spread_bid_ask_max,
    )

    # Safe allowlisted sorting
    if sort_by is not None:
        sort_column = PUT_OPTION_SORT_FIELDS[sort_by]

        if sort_dir == "asc":
            query = query.order_by(sort_column.asc(), PutOption.contract.asc())
        else:
            query = query.order_by(sort_column.desc(), PutOption.contract.asc())
    else:
        query = query.order_by(
            PutOption.expiry_date.asc(),
            PutOption.contract.asc(),
        )

    return query.offset(offset).limit(limit).all()
