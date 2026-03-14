
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.paths import DATA_DIR

from ingestion.base import ingest_json_file
from app.models.spread_option import SpreadOption
from app.core.middleware.logging import get_logger

logger = get_logger(__name__)

print("spread_options module loaded!")

# DATA_FILE = Path("data/spreads.json")
JSON_PATH = DATA_DIR / "spreads.json"

REQUIRED_FIELDS = [
    "contract",
    "ticker",
    "exchange",
    "expiry_date",
    "current_price",
    "strike_price",
]

CONFLICT_COLUMNS = ["contract"]


def ingest_spread_options(db: Session):
    print("ingest_spread_options function loaded!")
    logger.info("Ingesting spread options")

    ingest_json_file(
        db=db,
        model=SpreadOption,
        json_path=JSON_PATH,
        required_fields=REQUIRED_FIELDS,
        conflict_columns=CONFLICT_COLUMNS,
        set_updated_at=True,
    )

if __name__ == "__main__":
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        ingest_spread_options(db)
    finally:
        db.close()
