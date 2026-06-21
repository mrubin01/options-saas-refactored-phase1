from datetime import date


def parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD
