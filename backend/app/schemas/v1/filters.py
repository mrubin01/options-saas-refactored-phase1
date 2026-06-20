from typing import Literal
from pydantic import BaseModel, Field


class NumericRange(BaseModel):
    min: float | None = None
    max: float | None = None


class PaginationParams(BaseModel):
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)


class SortParams(BaseModel):
    sort_by: str | None = None
    sort_dir: Literal["asc", "desc"] = "desc"
