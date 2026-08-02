from typing import Any, Literal, Type

from sqlalchemy.orm import Session

from app.core.utils import parse_date

LongOptionsSortField = Literal[
    "ticker",
    "expiry_date",
    "days_to_expiration",
    "premium_per_contract",
    "iv_hv_ratio",
    "open_interest",
    "impl_volatility",
    "delta",
    "moneyness",
    "spread_bid_ask",
    "return_5pct",
    "return_10pct",
]

SORT_FIELD_NAMES = [
    "ticker",
    "expiry_date",
    "days_to_expiration",
    "premium_per_contract",
    "iv_hv_ratio",
    "open_interest",
    "impl_volatility",
    "delta",
    "moneyness",
    "spread_bid_ask",
    "return_5pct",
    "return_10pct",
]


def _apply_min_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column >= value)


def _apply_max_filter(query, column, value):
    if value is None:
        return query
    return query.filter(column <= value)


def _apply_filters(query, model: Type[Any], **kwargs) -> Any:
    if kwargs.get("exchange") is not None:
        query = query.filter(model.exchange == kwargs["exchange"])
    if kwargs.get("contract") is not None:
        query = query.filter(model.contract == kwargs["contract"])
    if kwargs.get("ticker") is not None:
        query = query.filter(model.ticker == kwargs["ticker"].upper())
    if kwargs.get("expiry_date") is not None:
        query = query.filter(model.expiry_date == parse_date(kwargs["expiry_date"]))
    elif kwargs.get("min_expiry") is not None:
        query = query.filter(model.expiry_date >= parse_date(kwargs["min_expiry"]))
    if kwargs.get("main_trend") is not None:
        query = query.filter(model.main_trend == kwargs["main_trend"])
    if kwargs.get("sector") is not None:
        query = query.filter(model.sector == kwargs["sector"])
    if kwargs.get("industry") is not None:
        query = query.filter(model.industry == kwargs["industry"])

    query = _apply_min_filter(query, model.days_to_expiration, kwargs.get("days_to_expiration_min"))
    query = _apply_max_filter(query, model.days_to_expiration, kwargs.get("days_to_expiration_max"))
    query = _apply_min_filter(query, model.premium_per_contract, kwargs.get("premium_per_contract_min"))
    query = _apply_max_filter(query, model.premium_per_contract, kwargs.get("premium_per_contract_max"))
    query = _apply_min_filter(query, model.open_interest, kwargs.get("open_interest_min"))
    query = _apply_max_filter(query, model.open_interest, kwargs.get("open_interest_max"))
    query = _apply_min_filter(query, model.impl_volatility, kwargs.get("impl_volatility_min"))
    query = _apply_max_filter(query, model.impl_volatility, kwargs.get("impl_volatility_max"))
    query = _apply_min_filter(query, model.delta, kwargs.get("delta_min"))
    query = _apply_max_filter(query, model.delta, kwargs.get("delta_max"))
    query = _apply_min_filter(query, model.moneyness, kwargs.get("moneyness_min"))
    query = _apply_max_filter(query, model.moneyness, kwargs.get("moneyness_max"))
    query = _apply_min_filter(query, model.spread_bid_ask, kwargs.get("spread_bid_ask_min"))
    query = _apply_max_filter(query, model.spread_bid_ask, kwargs.get("spread_bid_ask_max"))
    query = _apply_min_filter(query, model.iv_hv_ratio, kwargs.get("iv_hv_ratio_min"))
    query = _apply_max_filter(query, model.iv_hv_ratio, kwargs.get("iv_hv_ratio_max"))
    query = _apply_min_filter(query, model.return_5pct, kwargs.get("return_5pct_min"))
    query = _apply_max_filter(query, model.return_5pct, kwargs.get("return_5pct_max"))
    query = _apply_min_filter(query, model.return_10pct, kwargs.get("return_10pct_min"))
    query = _apply_max_filter(query, model.return_10pct, kwargs.get("return_10pct_max"))

    return query


def build_long_options_query(
    *,
    db: Session,
    model: Type[Any],
    exchange: int | None = None,
    ticker: str | None = None,
    contract: str | None = None,
    expiry_date: str | None = None,
    min_expiry: str | None = None,
    days_to_expiration_min: int | None = None,
    days_to_expiration_max: int | None = None,
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
    iv_hv_ratio_min: float | None = None,
    iv_hv_ratio_max: float | None = None,
    return_5pct_min: float | None = None,
    return_5pct_max: float | None = None,
    return_10pct_min: float | None = None,
    return_10pct_max: float | None = None,
    main_trend: int | None = None,
    sector: str | None = None,
    industry: str | None = None,
    sort_by: LongOptionsSortField | None = None,
    sort_dir: Literal["asc", "desc"] = "asc",
    limit: int = 50,
    offset: int = 0,
) -> tuple[list, int]:
    filter_kwargs = dict(
        exchange=exchange, ticker=ticker, contract=contract,
        expiry_date=expiry_date, min_expiry=min_expiry,
        days_to_expiration_min=days_to_expiration_min, days_to_expiration_max=days_to_expiration_max,
        premium_per_contract_min=premium_per_contract_min, premium_per_contract_max=premium_per_contract_max,
        open_interest_min=open_interest_min, open_interest_max=open_interest_max,
        impl_volatility_min=impl_volatility_min, impl_volatility_max=impl_volatility_max,
        delta_min=delta_min, delta_max=delta_max,
        moneyness_min=moneyness_min, moneyness_max=moneyness_max,
        spread_bid_ask_min=spread_bid_ask_min, spread_bid_ask_max=spread_bid_ask_max,
        iv_hv_ratio_min=iv_hv_ratio_min, iv_hv_ratio_max=iv_hv_ratio_max,
        return_5pct_min=return_5pct_min, return_5pct_max=return_5pct_max,
        return_10pct_min=return_10pct_min, return_10pct_max=return_10pct_max,
        main_trend=main_trend,
        sector=sector, industry=industry,
    )

    filtered = _apply_filters(db.query(model), model, **filter_kwargs)
    total = filtered.count()

    sort_fields = {name: getattr(model, name) for name in SORT_FIELD_NAMES}
    if sort_by is not None:
        sort_column = sort_fields[sort_by]
        order = sort_column.asc() if sort_dir == "asc" else sort_column.desc()
        filtered = filtered.order_by(order, model.contract.asc())
    else:
        # Default: cheapest options first (best value for buyers)
        filtered = filtered.order_by(model.iv_hv_ratio.asc().nullslast(), model.contract.asc())

    data = filtered.offset(offset).limit(limit).all()
    return data, total
