from datetime import datetime, timezone
from typing import Any, Literal

from sqlalchemy.orm import Session

from app.services.data_freshness import get_data_freshness

IngestionStatus = Literal["fresh", "aging", "stale", "empty", "unknown"]

FRESH_THRESHOLD_MINUTES = 180
AGING_THRESHOLD_MINUTES = 1_440


def _to_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def _get_age_minutes(last_updated: datetime | None) -> int | None:
    normalized_last_updated = _to_utc(last_updated)

    if normalized_last_updated is None:
        return None

    now = datetime.now(timezone.utc)
    age_seconds = (now - normalized_last_updated).total_seconds()

    return max(0, int(age_seconds // 60))


def _get_status(
    last_updated: datetime | None,
    row_count: int,
) -> IngestionStatus:
    if row_count <= 0:
        return "empty"

    age_minutes = _get_age_minutes(last_updated)

    if age_minutes is None:
        return "unknown"

    if age_minutes <= FRESH_THRESHOLD_MINUTES:
        return "fresh"

    if age_minutes <= AGING_THRESHOLD_MINUTES:
        return "aging"

    return "stale"


def _get_strategy_status(
    freshness: dict[str, Any],
) -> dict[str, datetime | int | str | None]:
    last_updated = freshness.get("last_updated")
    row_count = int(freshness.get("row_count") or 0)

    if last_updated is not None and not isinstance(last_updated, datetime):
        last_updated = None

    age_minutes = _get_age_minutes(last_updated)
    status = _get_status(last_updated, row_count)

    return {
        "status": status,
        "last_updated": last_updated,
        "age_minutes": age_minutes,
        "row_count": row_count,
    }


def _get_overall_status(
    strategy_statuses: dict[str, dict[str, datetime | int | str | None]],
) -> IngestionStatus:
    statuses = {str(value["status"]) for value in strategy_statuses.values()}

    if "empty" in statuses:
        return "empty"

    if "unknown" in statuses:
        return "unknown"

    if "stale" in statuses:
        return "stale"

    if "aging" in statuses:
        return "aging"

    return "fresh"


def get_ingestion_status(db: Session) -> dict[str, Any]:
    freshness = get_data_freshness(db)

    strategies = {
        "covered_calls": _get_strategy_status(freshness["covered_calls"]),
        "put_options": _get_strategy_status(freshness["put_options"]),
        "spread_options": _get_strategy_status(freshness["spread_options"]),
    }

    return {
        "overall_status": _get_overall_status(strategies),
        "thresholds": {
          "fresh_minutes": FRESH_THRESHOLD_MINUTES,
          "aging_minutes": AGING_THRESHOLD_MINUTES,
        },
        "strategies": strategies,
    }
