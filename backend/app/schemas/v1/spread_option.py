from datetime import date, datetime
from pydantic import BaseModel
from typing import List
from typing import Literal
from pydantic import BaseModel, Field

# response schema: data to expose via API   

class SpreadOptionBase(BaseModel):
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
    open_interest: int | None = None
    impl_volatility: float | None = None
    option_yield: float | None = None
    roc: float | None = None
    tot_return: float | None = None
    delta: float | None = None
    highest_price: float | None = None
    avg_price: float | None = None
    lowest_price: float | None = None
    main_trend: float | None = None

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

# Stage 5.1 Discovery schemas


SpreadOptionSortField = Literal[
    "ticker",
    "expiry_date",
    "days_to_expiration",
    "premium_per_contract",
    "option_yield",
    "roc",
    "total_return",
    "open_interest",
    "impl_volatility",
    "delta",
    "moneyness",
]


SortDirection = Literal["asc", "desc"]


class SpreadOptionDiscoveryParams(BaseModel):
    """
    Canonical Stage 5.1 discovery contract for spread options.

    This model is useful for documentation, tests, and future refactors.
    The FastAPI route may still expose these as individual Query params.
    """

    # Existing filters
    exchange: int | None = None
    ticker: str | None = Field(default=None, min_length=1, max_length=20)
    contract: str | None = Field(default=None, min_length=1, max_length=100)
    min_expiry: date | None = None

    # Discovery range filters
    days_to_expiration_min: int | None = Field(default=None, ge=0)
    days_to_expiration_max: int | None = Field(default=None, ge=0)

    premium_per_contract_min: float | None = Field(default=None, ge=0)
    premium_per_contract_max: float | None = Field(default=None, ge=0)

    option_yield_min: float | None = None
    option_yield_max: float | None = None

    roc_min: float | None = None
    roc_max: float | None = None

    tot_return_min: float | None = None
    tot_return_max: float | None = None

    open_interest_min: int | None = Field(default=None, ge=0)
    open_interest_max: int | None = Field(default=None, ge=0)

    impl_volatility_min: float | None = Field(default=None, ge=0)
    impl_volatility_max: float | None = Field(default=None, ge=0)

    delta_min: float | None = None
    delta_max: float | None = None

    moneyness_min: float | None = None
    moneyness_max: float | None = None

    # Sorting
    sort_by: SpreadOptionSortField | None = None
    sort_dir: SortDirection = "desc"

    # Pagination
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
    