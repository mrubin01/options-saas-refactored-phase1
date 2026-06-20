from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, validator


StrategyType = Literal["covered_calls", "put_options", "spread_options"]


class SavedScreenerConfig(BaseModel):
    filters: dict[str, Any] = Field(default_factory=dict)
    sort: dict[str, Any] | None = None


class SavedScreenerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    strategy_type: StrategyType
    config_json: SavedScreenerConfig

    @validator("name")
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class SavedScreenerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    config_json: SavedScreenerConfig | None = None

    @validator("name")
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class SavedScreenerOut(BaseModel):
    id: int
    user_id: int
    name: str
    strategy_type: StrategyType
    config_json: SavedScreenerConfig
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        