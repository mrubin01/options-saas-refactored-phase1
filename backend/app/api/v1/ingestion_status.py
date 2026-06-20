from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.response import ok
from app.db.database import get_db
from app.models.user import User
from app.services.ingestion_status import get_ingestion_status

router = APIRouter(prefix="/ingestion-status", tags=["ingestion-status"])


@router.get("")
def get_current_ingestion_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = get_ingestion_status(db)
    return ok(data=data)
