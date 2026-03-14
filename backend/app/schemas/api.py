from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel
from datetime import datetime, timezone


T = TypeVar("T")


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    total: int
    has_next: bool


class ApiMeta(BaseModel):
    request_id: str | None = None
    version: str = "v1"
    pagination: PaginationMeta | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApiError(BaseModel):
    code: str  # "AUTH_INVALID", "NOT_FOUND", "RATE_LIMITED"
    message: str
    details: dict[str, Any] | None = None
    request_id: Optional[str] = None


class ApiResponse(GenericModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ApiError] = None
    meta: Optional[ApiMeta] = None
