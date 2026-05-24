from datetime import date, datetime
from pydantic import BaseModel
from typing import List

# response schema: data to expose via API   

class PutOptionBase(BaseModel):
    contract: str
    ticker: str
    exchange: int
    expiry_date: date
    current_price: float
    strike_price: float

    days_to_expiration: int | None = None
    coeff_variation: float | None = None
    max_profit: float | None = None
    max_profit_per_contract: float | None = None
    otm: float | None = None
    moneyness: float | None = None
    sigma_distance: float | None = None
    bid_per_share: float | None = None
    premium_per_contract: float | None = None
    spread_bid_ask: float | None = None
    break_even: float | None = None
    open_interest: int | None = None  # nullable 
    impl_volatility: float | None = None
    option_yield: float | None = None
    roc: float | None = None
    tot_return: float | None = None
    delta: float | None = None
    highest_price: float | None = None
    avg_price: float | None = None
    lowest_price: float | None = None
    main_trend: float | None = None

    beta: float | None = None  # nullable
    sector: str | None = None  # nullable
    industry: str | None = None  # nullable

    updated_at: datetime | None = None

class PutOptionOut(PutOptionBase):
    class Config:
        orm_mode = True

class PutOptionList(BaseModel):
    items: List[PutOptionOut]
    limit: int
    offset: int
