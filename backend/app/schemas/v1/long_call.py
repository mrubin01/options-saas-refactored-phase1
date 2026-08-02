from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Literal


class LongCallOut(BaseModel):
    contract: str
    ticker: str
    exchange: int
    expiry_date: date
    current_price: float
    strike_price: float

    days_to_expiration: int | None = None
    coeff_variation: float | None = None
    otm: float | None = None
    moneyness: float | None = None
    sigma_distance: float | None = None
    ask_per_share: float | None = None
    premium_per_contract: float | None = None
    spread_bid_ask: float | None = None
    break_even: float | None = None
    open_interest: int | None = None
    impl_volatility: float | None = None
    delta: float | None = None
    highest_price: float | None = None
    avg_price: float | None = None
    lowest_price: float | None = None
    main_trend: float | None = None

    beta: float | None = None
    sector: str | None = None
    industry: str | None = None
    iv_hv_ratio: float | None = None
    ex_dividend_date: date | None = None
    earnings_date: date | None = None

    profit_5pct: float | None = None
    return_5pct: float | None = None
    profit_10pct: float | None = None
    return_10pct: float | None = None

    updated_at: datetime | None = None

    class Config:
        orm_mode = True


LongCallSortField = Literal[
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
