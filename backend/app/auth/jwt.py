from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt

from app.core.config import settings


def _build_token(
    *,
    data: dict[str, Any],
    expires_delta: timedelta,
    token_type: str,
) -> str:
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not configured")

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    to_encode = data.copy()
    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "type": token_type,
            "jti": str(uuid4()),
        }
    )

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_access_token(data: dict[str, Any]) -> str:
    return _build_token(
        data=data,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(data: dict[str, Any]) -> str:
    return _build_token(
        data=data,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def decode_token(token: str) -> dict[str, Any]:
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not configured")

    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )


def get_token_type(payload: dict[str, Any]) -> str | None:
    return payload.get("type")


def get_token_jti(payload: dict[str, Any]) -> str | None:
    return payload.get("jti")


def get_token_subject(payload: dict[str, Any]) -> str | None:
    return payload.get("sub")
