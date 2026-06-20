from datetime import datetime
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.covered_call import CoveredCall
from app.models.put_option import PutOption
from app.models.spread_option import SpreadOption


def _get_table_freshness(db: Session, model: Any) -> dict[str, Any]:
    last_updated, row_count = (
        db.query(
            func.max(model.updated_at),
            func.count(model.contract),
        )
        .one()
    )

    return {
        "last_updated": last_updated,
        "row_count": row_count,
    }


def get_data_freshness(db: Session) -> dict[str, dict[str, datetime | int | None]]:
    return {
        "covered_calls": _get_table_freshness(db, CoveredCall),
        "put_options": _get_table_freshness(db, PutOption),
        "spread_options": _get_table_freshness(db, SpreadOption),
    }
