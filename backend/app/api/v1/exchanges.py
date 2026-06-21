from fastapi import APIRouter, Depends, Request
from fastapi_cache.decorator import cache
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.cache import cache_key_builder
from app.core.response import ok
from app.db.database import get_db
from app.models.exchange import Exchange
from app.models.user import User
from app.schemas.api import ApiResponse
from app.schemas.v1.exchange import ExchangeOut

router = APIRouter(prefix="/exchanges", tags=["exchanges"])


@router.get("", response_model=ApiResponse[list[ExchangeOut]])
@cache(expire=3600, key_builder=cache_key_builder, namespace="v1:exchanges")
async def list_exchanges(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.query(Exchange).order_by(Exchange.exchange_id).all()
    data = [ExchangeOut(id=row.exchange_id, name=row.exchange_name) for row in rows]
    return ok(data=data, request=request)
