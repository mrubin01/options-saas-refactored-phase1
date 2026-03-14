from pathlib import Path
from sqlalchemy.orm import Session
from app.core.paths import DATA_DIR

from ingestion.base import ingest_json_file
from app.models.covered_call import CoveredCall
from app.core.middleware.logging import get_logger

logger = get_logger(__name__)

print("covered_calls module loaded!")

# DATA_FILE = Path("options-saas/shared/data/ccs.json")

JSON_PATH = DATA_DIR / "ccs.json"

REQUIRED_FIELDS = [
    "contract",
    "ticker",
    "exchange",
    "expiry_date",
    "current_price",
    "strike_price",
]

CONFLICT_COLUMNS = ["contract"]


def ingest_covered_calls(db: Session):
    print("ingest_covered_calls function loaded!")

    logger.info("Ingesting covered calls")

    ingest_json_file(
        db=db,
        model=CoveredCall,
        json_path=JSON_PATH,
        required_fields=REQUIRED_FIELDS,
        conflict_columns=CONFLICT_COLUMNS,
        set_updated_at=True,
    )

if __name__ == "__main__":
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        ingest_covered_calls(db)
    finally:
        db.close()
