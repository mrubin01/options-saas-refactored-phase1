import hashlib
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.auth.jwt import create_refresh_token, decode_token, get_token_jti, get_token_subject
from app.core.config import settings
from app.models.refresh_session import RefreshSession
from app.models.user import User


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_refresh_session(db: Session, user: User) -> tuple[str, RefreshSession]:
    refresh_token = create_refresh_token({"sub": str(user.id)})
    payload = decode_token(refresh_token)

    jti = get_token_jti(payload)
    sub = get_token_subject(payload)
    exp = payload.get("exp")

    if not jti or not sub or not exp:
        raise ValueError("Invalid refresh token payload")

    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)

    session = RefreshSession(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        jti=jti,
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return refresh_token, session


def get_refresh_session_by_token(db: Session, raw_refresh_token: str) -> Optional[RefreshSession]:
    token_hash = hash_refresh_token(raw_refresh_token)
    return db.query(RefreshSession).filter(RefreshSession.token_hash == token_hash).first()


def is_refresh_session_active(session: RefreshSession) -> bool:
    now = datetime.now(timezone.utc)

    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return session.revoked_at is None and expires_at > now


def revoke_refresh_session(session: RefreshSession, db: Session) -> None:
    session.revoked_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()


def rotate_refresh_session(db: Session, current_session: RefreshSession, user: User) -> tuple[str, RefreshSession]:
    revoke_refresh_session(current_session, db)
    return create_refresh_session(db, user)
