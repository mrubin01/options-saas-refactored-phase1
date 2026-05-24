from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


StrategyType = Literal["covered_calls", "put_options", "spread_options"]


class WatchlistItemCreate(BaseModel):
    strategy_type: StrategyType
    contract: str = Field(..., min_length=1, max_length=64)
    ticker: str = Field(..., min_length=1, max_length=32)
    exchange: int


class WatchlistItemOut(BaseModel):
    id: int
    user_id: int
    strategy_type: StrategyType
    contract: str
    ticker: str
    exchange: int
    created_at: datetime

    class Config:
        orm_mode = True

