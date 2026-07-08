import json
import logging
import time
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

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
LONDON = ZoneInfo("Europe/London")
WINDOW_START = (14, 30)
WINDOW_END = (21, 0)

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


def seconds_until_window() -> float:
    now = datetime.now(LONDON)
    start = now.replace(hour=WINDOW_START[0], minute=WINDOW_START[1], second=0, microsecond=0)
    if now >= start:
        start += timedelta(days=1)
    delta = (start - now).total_seconds()
    return delta


def in_window() -> bool:
    now = datetime.now(LONDON)
    start_mins = WINDOW_START[0] * 60 + WINDOW_START[1]
    end_mins = WINDOW_END[0] * 60 + WINDOW_END[1]
    current_mins = now.hour * 60 + now.minute
    return start_mins <= current_mins < end_mins


def main() -> None:
    logger.info("Ingestion watcher started. Window: %02d:%02d–%02d:%02d BST.", *WINDOW_START, *WINDOW_END)
    last_ingested: dict[str, float] = {name: 0.0 for name, _, _ in STRATEGIES}

    while True:
        if not in_window():
            secs = seconds_until_window()
            next_time = datetime.now(LONDON) + timedelta(seconds=secs)
            logger.info("Outside window. Sleeping %.1fh until %s BST.", secs / 3600, next_time.strftime("%H:%M"))
            time.sleep(secs)
            continue

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
