from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.error_codes import ErrorCode
from app.core.exceptions import AppException
from app.models.saved_screener import SavedScreener
from app.schemas.v1.saved_screener import SavedScreenerCreate, SavedScreenerUpdate


def list_saved_screeners(db: Session, user_id: int, strategy_type: str | None = None) -> list[SavedScreener]:
    query = db.query(SavedScreener).filter(SavedScreener.user_id == user_id)

    if strategy_type:
        query = query.filter(SavedScreener.strategy_type == strategy_type)

    return query.order_by(SavedScreener.updated_at.desc(), SavedScreener.id.desc()).all()


def get_saved_screener(db: Session, user_id: int, screener_id: int) -> SavedScreener:
    screener = (
        db.query(SavedScreener)
        .filter(SavedScreener.id == screener_id, SavedScreener.user_id == user_id)
        .one_or_none()
    )
    if not screener:
        raise AppException(
            code=getattr(ErrorCode, "NOT_FOUND", "NOT_FOUND"),
            message="Saved screener not found",
            status_code=404,
        )
    return screener


def create_saved_screener(db: Session, user_id: int, payload: SavedScreenerCreate) -> SavedScreener:
    screener = SavedScreener(
        user_id=user_id,
        name=payload.name,
        strategy_type=payload.strategy_type,
        config_json=payload.config_json.dict(),
    )
    db.add(screener)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppException(
            code=getattr(ErrorCode, "CONFLICT", "CONFLICT"),
            message="A saved screener with this name already exists for this strategy",
            status_code=409,
        )

    db.refresh(screener)
    return screener


def update_saved_screener(db: Session, user_id: int, screener_id: int, payload: SavedScreenerUpdate) -> SavedScreener:
    screener = get_saved_screener(db, user_id, screener_id)

    if payload.name is not None:
        setattr(screener, "name", payload.name)
    if payload.config_json is not None:
        setattr(screener, "config_json", payload.config_json.dict())

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppException(
            code=getattr(ErrorCode, "CONFLICT", "CONFLICT"),
            message="A saved screener with this name already exists for this strategy",
            status_code=409,
        )

    db.refresh(screener)
    return screener


def delete_saved_screener(db: Session, user_id: int, screener_id: int) -> None:
    screener = get_saved_screener(db, user_id, screener_id)
    db.delete(screener)
    db.commit()
