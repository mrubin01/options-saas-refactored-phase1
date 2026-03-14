import json
from pathlib import Path
from datetime import date, datetime, timezone
from typing import Type

from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from app.core.middleware.logging import get_logger

logger = get_logger(__name__)


# ---------- helpers ----------

from datetime import date, datetime

def parse_date(value: str) -> date:
    """
    Parse a date string into a date object.
    Supports:
    - YYYY-MM-DD (ISO)
    - DD/MM/YYYY (European)
    """
    if not value:
        raise ValueError("Empty date value")

    value = value.strip()

    # ISO format: 2025-11-14
    try:
        return date.fromisoformat(value)
    except ValueError:
        pass

    # European format: 14/11/2025
    try:
        return datetime.strptime(value, "%d/%m/%Y").date()
    except ValueError:
        pass

    raise ValueError(f"Unsupported date format: {value}")


def normalize_record(record: dict) -> dict:
    """
    Normalize raw JSON record into DB-ready format.
    """
    r = record.copy()

    if "expiry_date" in r:
        r["expiry_date"] = parse_date(r["expiry_date"])

    if "ticker" in r and r["ticker"]:
        r["ticker"] = r["ticker"].upper()

    return r


def validate_record(record: dict, required_fields: list[str]):
    for field in required_fields:
        if field not in record:
            raise ValueError(f"Missing required field: {field}")
        if record[field] is None:
            raise ValueError(f"Null value for field: {field}")


# ---------- core ingestion ----------

def upsert_records(
    db: Session,
    model: Type,
    records: list[dict],
    conflict_columns: list[str],
):
    """
    PostgreSQL UPSERT (ON CONFLICT DO UPDATE)
    """
    if not records:
        logger.info("No records to ingest", extra={"table": model.__tablename__})
        return

    stmt = insert(model).values(records)

    update_columns = {
        col.name: stmt.excluded[col.name]
        for col in model.__table__.columns
        if col.name not in conflict_columns
    }

    stmt = stmt.on_conflict_do_update(
        index_elements=conflict_columns,
        set_=update_columns,
    )

    db.execute(stmt)
    db.commit()

    logger.info(
        "Upsert completed",
        extra={
            "table": model.__tablename__,
            "rows": len(records),
        },
    )


def ingest_json_file(
    *,
    db: Session,
    model: Type,
    json_path: Path,
    required_fields: list[str],
    conflict_columns: list[str],
    set_updated_at: bool = False,
):
    """
    Generic JSON → PostgreSQL ingestion
    """
    logger.info(
        "Starting ingestion",
        extra={"table": model.__tablename__, "file": str(json_path)},
    )

    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")

    with json_path.open() as f:
        raw_records = json.load(f)

    records = []
    for raw in raw_records:
        validate_record(raw, required_fields)
        normalized = normalize_record(raw)
        if set_updated_at and hasattr(model, "updated_at"):
            normalized["updated_at"] = datetime.now(timezone.utc)
        
        records.append(normalized)

    upsert_records(
        db=db,
        model=model,
        records=records,
        conflict_columns=conflict_columns,
    )


