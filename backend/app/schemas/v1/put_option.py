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

    rel_std_deviation: float
    spread_premium_price_and_bid: float
    spread_strike_price: float
    bid_per_share: float
    premium_per_contract: float
    spread_bid_ask: float
    open_interest: int | None = None
    impl_volatility: float
    ratio_bid_strike: float
    highest_price: float
    avg_price: float
    lowest_price: float
    main_trend: float

    beta: int | None = None
    sector: str | None = None
    industry: str | None = None

    updated_at: datetime | None = None

class PutOptionOut(PutOptionBase):
    class Config:
        orm_mode = True

class PutOptionList(BaseModel):
    items: List[PutOptionOut]
    limit: int
    offset: int
