from datetime import date, datetime
from pydantic import BaseModel
from typing import List

# response schema: data to expose via API   

class SpreadOptionBase(BaseModel):
    contract: str
    ticker: str
    exchange: int
    expiry_date: date
    current_price: float
    strike_price: float

    days_to_expiration: int
    coeff_variation: float
    max_profit: float
    max_profit_per_contract: float
    otm: float
    moneyness: float
    sigma_distance: float
    bid_per_share: float
    premium_per_contract: float
    spread_bid_ask: float
    break_even: float
    open_interest: int | None = None
    impl_volatility: float
    option_yield: float
    roc: float
    tot_return: float
    delta: float
    highest_price: float
    avg_price: float
    lowest_price: float
    main_trend: float

    beta: float | None = None
    sector: str | None = None
    industry: str | None = None
    
    updated_at: datetime | None = None

class SpreadOptionOut(SpreadOptionBase):
    class Config:
        orm_mode = True

class SpreadOptionList(BaseModel):
    items: List[SpreadOptionOut]
    limit: int
    offset: int
