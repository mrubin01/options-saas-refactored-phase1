from __future__ import annotations

from datetime import datetime, timezone, date
from pathlib import Path
import json
import math

from sqlalchemy.orm import Session
from sqlalchemy import insert

from app.core.paths import DATA_DIR
from app.models.put_option import PutOption
from app.core.middleware.logging import get_logger

logger = get_logger(__name__)

print("put_options module loaded!")

JSON_PATHS = [
    DATA_DIR / "best_put_options_nyse.json",
    DATA_DIR / "best_put_options_nasdaq.json",
    DATA_DIR / "best_put_options_arca.json",
]

REQUIRED_FIELDS = [
    "contract",
    "ticker",
    "exchange",
    "expiry_date",
    "current_price",
    "strike_price",
]

CONFLICT_COLUMNS = ["contract"]


def parse_expiry_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def normalize_int(value):
    if value is None:
        return None
    if isinstance(value, float):
        if math.isnan(value):
            return None
        return int(value)
    return int(value)


def normalize_float(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    return float(value)


def normalize_row(row: dict) -> dict:
    for field in REQUIRED_FIELDS:
        if field not in row or row[field] is None:
            raise ValueError(f"Missing required field '{field}' in put options row: {row}")

    sector = row.get("sector")
    industry = row.get("industry")
    beta = row.get("beta")

    now = datetime.now(timezone.utc)

    return {
        "ticker": row["ticker"],
        "exchange": normalize_int(row["exchange"]),
        "contract": row["contract"],
        "expiry_date": parse_expiry_date(row["expiry_date"]),
        "current_price": normalize_float(row["current_price"]),
        "strike_price": normalize_float(row["strike_price"]),
        "rel_std_deviation": normalize_float(row.get("rel_std_deviation")),
        "spread_premium_price_and_bid": normalize_float(row.get("spread_premium_price_and_bid")),
        "spread_strike_price": normalize_float(row.get("spread_strike_price")),
        "bid_per_share": normalize_float(row.get("bid_per_share")),
        "premium_per_contract": normalize_float(row.get("premium_per_contract")),
        "spread_bid_ask": normalize_float(row.get("spread_bid_ask")),
        "open_interest": normalize_int(row.get("open_interest")),
        "impl_volatility": normalize_float(row.get("impl_volatility")),
        "ratio_bid_strike": normalize_float(row.get("ratio_bid_strike")),
        "sector": sector,
        "industry": industry,
        "highest_price": normalize_float(row.get("highest_price")),
        "avg_price": normalize_float(row.get("avg_price")),
        "lowest_price": normalize_float(row.get("lowest_price")),
        "main_trend": normalize_int(row.get("main_trend")),
        "beta": normalize_float(row.get("beta")),
        "updated_at": now,
    }


def load_rows_from_file(json_path: Path) -> list[dict]:
    print(f"Loading file: {json_path}")

    if not json_path.exists():
        raise FileNotFoundError(f"Put options file not found: {json_path}")

    with json_path.open("r", encoding="utf-8-sig") as f:
        payload = json.load(f)

    if not isinstance(payload, list):
        raise ValueError(f"Expected a list in {json_path}, got {type(payload).__name__}")

    return payload


def ingest_put_options(db: Session) -> None:
    print("ingest_put_options function loaded!")
    logger.info("Replacing put options from exchange-specific files")

    all_payloads: list[dict] = []

    for json_path in JSON_PATHS:
        logger.info("Loading put options file", extra={"json_path": str(json_path)})
        rows = load_rows_from_file(json_path)

        for row in rows:
            all_payloads.append(normalize_row(row))

    logger.info("Deleting existing put options")
    db.query(PutOption).delete()

    logger.info("Inserting fresh put options", extra={"rows_to_insert": len(all_payloads)})
    db.execute(insert(PutOption), all_payloads)

    db.commit()
    logger.info("Put options replacement complete", extra={"rows_inserted": len(all_payloads)})


if __name__ == "__main__":
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        ingest_put_options(db)
    finally:
        db.close()
