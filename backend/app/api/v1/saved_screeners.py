from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.response import ok
from app.db.database import get_db
from app.models.user import User
from app.schemas.v1.saved_screener import (
    SavedScreenerCreate,
    SavedScreenerUpdate,
)
from app.services.saved_screeners_service import (
    create_saved_screener,
    delete_saved_screener,
    get_saved_screener,
    list_saved_screeners,
    update_saved_screener,
)

router = APIRouter(prefix="/saved-screeners", tags=["saved-screeners"])


@router.get("")
def list_user_saved_screeners(
    strategy_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = list_saved_screeners(db, current_user.id, strategy_type)
    return ok(data=data)


@router.get("/{screener_id}")
def get_user_saved_screener(
    screener_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = get_saved_screener(db, current_user.id, screener_id)
    return ok(data=data)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user_saved_screener(
    payload: SavedScreenerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = create_saved_screener(db, current_user.id, payload)
    return ok(data=data)


@router.put("/{screener_id}")
def update_user_saved_screener(
    screener_id: int,
    payload: SavedScreenerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = update_saved_screener(db, current_user.id, screener_id, payload)
    return ok(data=data)


@router.delete("/{screener_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_saved_screener(
    screener_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_saved_screener(db, current_user.id, screener_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
