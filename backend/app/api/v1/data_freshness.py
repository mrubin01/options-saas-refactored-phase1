from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.response import ok
from app.db.database import get_db
from app.models.user import User
from app.services.data_freshness import get_data_freshness

router = APIRouter(prefix="/data-freshness", tags=["data-freshness"])


@router.get("")
def get_current_data_freshness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = get_data_freshness(db)
    return ok(data=data)
