from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.error_codes import ErrorCode
from app.core.exceptions import AppException
from app.models.watchlist_item import WatchlistItem
from app.schemas.v1.watchlist_item import WatchlistItemCreate


def list_watchlist_items(db: Session, user_id: int, strategy_type: str | None = None) -> list[WatchlistItem]:
    query = db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id)

    if strategy_type:
        query = query.filter(WatchlistItem.strategy_type == strategy_type)

    return query.order_by(WatchlistItem.created_at.desc(), WatchlistItem.id.desc()).all()


def create_watchlist_item(db: Session, user_id: int, payload: WatchlistItemCreate) -> WatchlistItem:
    item = WatchlistItem(
        user_id=user_id,
        strategy_type=payload.strategy_type,
        contract=payload.contract,
        ticker=payload.ticker,
        exchange=payload.exchange,
    )
    db.add(item)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppException(
            code=getattr(ErrorCode, "CONFLICT", "CONFLICT"),
            message="This contract is already in your watchlist",
            status_code=409,
        )

    db.refresh(item)
    return item


def delete_watchlist_item(db: Session, user_id: int, item_id: int) -> None:
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.id == item_id, WatchlistItem.user_id == user_id)
        .one_or_none()
    )

    if not item:
        raise AppException(
            code=getattr(ErrorCode, "NOT_FOUND", "NOT_FOUND"),
            message="Watchlist item not found",
            status_code=404,
        )

    db.delete(item)
    db.commit()
