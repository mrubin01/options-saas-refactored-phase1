import json
import logging
import time
from pathlib import Path

from app.db.database import SessionLocal
from ingestion.covered_calls import JSON_PATHS as CC_PATHS, ingest_covered_calls
from ingestion.put_options import JSON_PATHS as PUT_PATHS, ingest_put_options
from ingestion.spread_options import JSON_PATHS as SPREAD_PATHS, ingest_spread_options

logging.basicConfig(
    format="[%(asctime)s] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

CHECK_INTERVAL = 300  # seconds

STRATEGIES = [
    ("covered_calls", CC_PATHS, ingest_covered_calls),
    ("put_options", PUT_PATHS, ingest_put_options),
    ("spread_options", SPREAD_PATHS, ingest_spread_options),
]


def is_non_empty(path: Path) -> bool:
    if not path.exists():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        return isinstance(data, list) and len(data) > 0
    except Exception:
        return False


def latest_mtime(paths: list[Path]) -> float:
    mtimes = [p.stat().st_mtime for p in paths if p.exists()]
    return max(mtimes) if mtimes else 0.0


def run_ingestion(name: str, ingest_fn) -> None:
    db = SessionLocal()
    try:
        ingest_fn(db)
        logger.info("Ingestion complete: %s", name)
    except Exception as exc:
        logger.error("Ingestion failed for %s: %s", name, exc)
    finally:
        db.close()


def main() -> None:
    logger.info("Ingestion watcher started. Interval: %ds.", CHECK_INTERVAL)
    last_ingested: dict[str, float] = {name: 0.0 for name, _, _ in STRATEGIES}

    while True:
        for name, paths, ingest_fn in STRATEGIES:
            blocked = [str(p) for p in paths if not is_non_empty(p)]
            if blocked:
                logger.info("Skipping %s — empty or missing: %s", name, blocked)
                continue

            newest = latest_mtime(paths)
            if newest <= last_ingested[name]:
                logger.info("No new data for %s.", name)
                continue

            logger.info("New data detected for %s, ingesting...", name)
            run_ingestion(name, ingest_fn)
            last_ingested[name] = time.time()

        logger.info("Sleeping %ds until next check.", CHECK_INTERVAL)
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
