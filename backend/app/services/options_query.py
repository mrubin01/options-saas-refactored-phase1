from typing import Any, Literal, Type

from sqlalchemy.orm import Session

from app.core.utils import parse_date

SORT_FIELD_NAMES = [
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

OptionsSortField = Literal[
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


def _apply_min_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column >= value)


def _apply_max_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column <= value)


def build_options_query(
    *,
    db: Session,
    model: Type[Any],
    exchange: int | None = None,
    ticker: str | None = None,
    contract: str | None = None,
    min_expiry: str | None = None,
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
    sector: str | None = None,
    industry: str | None = None,
    sort_by: OptionsSortField | None = None,
    sort_dir: Literal["asc", "desc"] = "desc",
    limit: int = 50,
    offset: int = 0,
) -> list:
    sort_fields = {name: getattr(model, name) for name in SORT_FIELD_NAMES}

    query = db.query(model)

    if exchange is not None:
        query = query.filter(model.exchange == exchange)
    if contract is not None:
        query = query.filter(model.contract == contract)
    if ticker is not None:
        query = query.filter(model.ticker == ticker.upper())
    if min_expiry is not None:
        query = query.filter(model.expiry_date >= parse_date(min_expiry))
    if sector is not None:
        query = query.filter(model.sector == sector)
    if industry is not None:
        query = query.filter(model.industry == industry)

    query = _apply_min_filter(query, model.days_to_expiration, days_to_expiration_min)
    query = _apply_max_filter(query, model.days_to_expiration, days_to_expiration_max)
    query = _apply_min_filter(query, model.option_yield, option_yield_min)
    query = _apply_max_filter(query, model.option_yield, option_yield_max)
    query = _apply_min_filter(query, model.roc, roc_min)
    query = _apply_max_filter(query, model.roc, roc_max)
    query = _apply_min_filter(query, model.tot_return, tot_return_min)
    query = _apply_max_filter(query, model.tot_return, tot_return_max)
    query = _apply_min_filter(query, model.premium_per_contract, premium_per_contract_min)
    query = _apply_max_filter(query, model.premium_per_contract, premium_per_contract_max)
    query = _apply_min_filter(query, model.open_interest, open_interest_min)
    query = _apply_max_filter(query, model.open_interest, open_interest_max)
    query = _apply_min_filter(query, model.impl_volatility, impl_volatility_min)
    query = _apply_max_filter(query, model.impl_volatility, impl_volatility_max)
    query = _apply_min_filter(query, model.delta, delta_min)
    query = _apply_max_filter(query, model.delta, delta_max)
    query = _apply_min_filter(query, model.moneyness, moneyness_min)
    query = _apply_max_filter(query, model.moneyness, moneyness_max)
    query = _apply_min_filter(query, model.spread_bid_ask, spread_bid_ask_min)
    query = _apply_max_filter(query, model.spread_bid_ask, spread_bid_ask_max)

    if sort_by is not None:
        sort_column = sort_fields[sort_by]
        order = sort_column.asc() if sort_dir == "asc" else sort_column.desc()
        query = query.order_by(order, model.contract.asc())
    else:
        query = query.order_by(model.expiry_date.asc(), model.contract.asc())

    return query.offset(offset).limit(limit).all()
