from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.response import ok
from app.db.database import get_db
from app.models.user import User
from app.schemas.v1.watchlist_item import WatchlistItemCreate, WatchlistItemOut
from app.services.watchlist_service import (
    create_watchlist_item,
    delete_watchlist_item,
    list_watchlist_items,
)

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("")
def get_watchlist(
    strategy_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = list_watchlist_items(db, current_user.id, strategy_type)
    return ok(data=data)


@router.post("", status_code=status.HTTP_201_CREATED)
def add_watchlist_item(
    payload: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data: WatchlistItemOut = create_watchlist_item(db, current_user.id, payload)
    return ok(data=data)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_watchlist_item(db, current_user.id, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
