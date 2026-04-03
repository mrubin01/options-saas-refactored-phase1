import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.auth_token import AuthToken
from app.models.user import User


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def invalidate_existing_tokens(db: Session, *, user_id: int, token_type: str) -> None:
    existing_tokens = (
        db.query(AuthToken)
        .filter(
            AuthToken.user_id == user_id,
            AuthToken.token_type == token_type,
            AuthToken.used_at.is_(None),
        )
        .all()
    )

    now = datetime.now(timezone.utc)
    for token in existing_tokens:
        token.used_at = now
        db.add(token)

    db.commit()


def create_one_time_token(
    db: Session,
    *,
    user: User,
    token_type: str,
    expires_in_minutes: int,
) -> str:
    invalidate_existing_tokens(db, user_id=user.id, token_type=token_type)

    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)

    record = AuthToken(
        user_id=user.id,
        token_hash=token_hash,
        token_type=token_type,
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return raw_token


def consume_one_time_token(
    db: Session,
    *,
    raw_token: str,
    token_type: str,
) -> AuthToken | None:
    token_hash = _hash_token(raw_token)

    record = (
        db.query(AuthToken)
        .filter(
            AuthToken.token_hash == token_hash,
            AuthToken.token_type == token_type,
        )
        .first()
    )

    if not record:
        return None

    now = datetime.now(timezone.utc)

    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if record.used_at is not None or expires_at <= now:
        return None

    record.used_at = now
    db.add(record)
    db.commit()
    db.refresh(record)

    return record
