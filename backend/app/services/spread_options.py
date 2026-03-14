from sqlalchemy.orm import Session
from app.models.spread_option import SpreadOption
from datetime import date

# API query layer  

def _parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD

def get_spread_options(
    db: Session,
    exchange: int | None = None,
    ticker: str | None = None,
    contract: str | None = None,
    min_expiry: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(SpreadOption)

    if exchange is not None:
        query = query.filter(SpreadOption.exchange == exchange)

    if contract is not None:
        query = query.filter(SpreadOption.contract == contract)
        
    if ticker is not None:
        query = query.filter(SpreadOption.ticker == ticker.upper())

    if min_expiry is not None:
        query = query.filter(SpreadOption.expiry_date >= _parse_date(min_expiry))

    return (
        query
        .order_by(SpreadOption.expiry_date.asc(), SpreadOption.contract.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

