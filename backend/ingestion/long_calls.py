from __future__ import annotations

from datetime import datetime, timezone, date
from pathlib import Path
import json
import math

from sqlalchemy.orm import Session
from sqlalchemy import insert

from app.core.paths import DATA_DIR
from app.models.long_call import LongCall
from app.core.middleware.logging import get_logger

logger = get_logger(__name__)

JSON_PATHS = [
    DATA_DIR / "best_long_calls_nyse.json",
    DATA_DIR / "best_long_calls_nasdaq.json",
    DATA_DIR / "best_long_calls_arca.json",
]

REQUIRED_FIELDS = [
    "contract",
    "ticker",
    "exchange",
    "expiry_date",
    "current_price",
    "strike_price",
]


def parse_date(value: str | None) -> date | None:
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
            raise ValueError(f"Missing required field '{field}' in long calls row: {row}")

    now = datetime.now(timezone.utc)

    return {
        "ticker": row["ticker"],
        "exchange": normalize_int(row["exchange"]),
        "contract": row["contract"],
        "expiry_date": parse_date(row["expiry_date"]),
        "current_price": normalize_float(row["current_price"]),
        "strike_price": normalize_float(row["strike_price"]),

        "days_to_expiration": normalize_int(row.get("days_to_expiration")),
        "coeff_variation": normalize_float(row.get("coeff_variation")),
        "otm": normalize_float(row.get("otm")),
        "moneyness": normalize_float(row.get("moneyness")),
        "sigma_distance": normalize_float(row.get("sigma_distance")),
        "ask_per_share": normalize_float(row.get("ask_per_share")),
        "premium_per_contract": normalize_float(row.get("premium_per_contract")),
        "spread_bid_ask": normalize_float(row.get("spread_bid_ask")),
        "break_even": normalize_float(row.get("break_even")),
        "open_interest": normalize_int(row.get("open_interest")),
        "impl_volatility": normalize_float(row.get("impl_volatility")),
        "delta": normalize_float(row.get("delta")),

        "highest_price": normalize_float(row.get("highest_price")),
        "avg_price": normalize_float(row.get("avg_price")),
        "lowest_price": normalize_float(row.get("lowest_price")),
        "main_trend": normalize_int(row.get("main_trend")),
        "beta": normalize_float(row.get("beta")),
        "sector": row.get("sector"),
        "industry": row.get("industry"),
        "iv_hv_ratio": normalize_float(row.get("iv_hv_ratio")),
        "ex_dividend_date": parse_date(row.get("ex_dividend_date")),
        "earnings_date": parse_date(row.get("earnings_date")),

        "profit_5pct": normalize_float(row.get("profit_5pct")),
        "return_5pct": normalize_float(row.get("return_5pct")),
        "profit_10pct": normalize_float(row.get("profit_10pct")),
        "return_10pct": normalize_float(row.get("return_10pct")),

        "updated_at": now,
    }


def load_rows_from_file(json_path: Path) -> list[dict]:
    if not json_path.exists():
        raise FileNotFoundError(f"Long calls file not found: {json_path}")

    with json_path.open("r", encoding="utf-8-sig") as f:
        payload = json.load(f)

    if not isinstance(payload, list):
        raise ValueError(f"Expected a list in {json_path}, got {type(payload).__name__}")

    return payload


def ingest_long_calls(db: Session) -> None:
    logger.info("Replacing long calls from exchange-specific files")

    all_payloads: list[dict] = []

    for json_path in JSON_PATHS:
        logger.info("Loading long calls file", extra={"json_path": str(json_path)})
        rows = load_rows_from_file(json_path)
        for row in rows:
            all_payloads.append(normalize_row(row))

    logger.info("Deleting existing long calls")
    db.query(LongCall).delete()

    logger.info("Inserting fresh long calls", extra={"rows_to_insert": len(all_payloads)})
    db.execute(insert(LongCall), all_payloads)

    db.commit()
    logger.info("Long calls replacement complete", extra={"rows_inserted": len(all_payloads)})


if __name__ == "__main__":
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        ingest_long_calls(db)
    finally:
        db.close()
