import sys
import time
import subprocess
from datetime import datetime, date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
import pandas_market_calendars as mcal

LONDON = ZoneInfo("Europe/London")
NYSE = mcal.get_calendar("NYSE")

SCAN_START_HOUR, SCAN_START_MIN = 14, 30   # 2:30 PM London — US market open
SCAN_CUTOFF_HOUR, SCAN_CUTOFF_MIN = 19, 30  # 7:30 PM London — no new scan after this

HERE = Path(__file__).parent


def _is_trading_day(d: date) -> bool:
    return not NYSE.schedule(start_date=str(d), end_date=str(d)).empty


def _next_window_start(after_dt: datetime) -> datetime:
    """Return the next 2:30 PM London on a NYSE trading day, strictly after after_dt."""
    d = after_dt.date()
    today_start = after_dt.replace(
        hour=SCAN_START_HOUR, minute=SCAN_START_MIN, second=0, microsecond=0
    )
    if today_start > after_dt and _is_trading_day(d):
        return today_start
    d += timedelta(days=1)
    while not _is_trading_day(d):
        d += timedelta(days=1)
    return datetime(d.year, d.month, d.day, SCAN_START_HOUR, SCAN_START_MIN, 0, tzinfo=LONDON)


def _log(msg: str):
    ts = datetime.now(tz=LONDON).strftime("%Y-%m-%d %H:%M:%S %Z")
    print(f"[{ts}] {msg}", flush=True)


def _sleep_until(target: datetime):
    delay = (target - datetime.now(tz=LONDON)).total_seconds()
    if delay > 0:
        _log(f"Sleeping {delay / 3600:.1f}h until {target.strftime('%Y-%m-%d %H:%M %Z')}.")
        time.sleep(delay)


def main():
    _log("Scheduler started.")
    while True:
        now = datetime.now(tz=LONDON)
        today = now.date()

        if not _is_trading_day(today):
            _sleep_until(_next_window_start(now))
            continue

        start = now.replace(hour=SCAN_START_HOUR, minute=SCAN_START_MIN, second=0, microsecond=0)
        cutoff = now.replace(hour=SCAN_CUTOFF_HOUR, minute=SCAN_CUTOFF_MIN, second=0, microsecond=0)

        if now < start:
            _sleep_until(start)
            continue

        if now >= cutoff:
            _sleep_until(_next_window_start(now))
            continue

        _log("Starting full scan (all 9 combinations).")
        subprocess.run([sys.executable, "main.py"], cwd=HERE)
        _log("Scan complete. Checking window...")


if __name__ == "__main__":
    main()
