from sqlalchemy.orm import Session
from app.models.covered_call import CoveredCall
from datetime import date


# API query layer  

def _parse_date(value: str) -> date:
    return date.fromisoformat(value)  # expects YYYY-MM-DD

def get_covered_calls(
    db: Session,
    exchange: int | None = None,
    ticker: str | None = None,
    contract: str | None = None,
    min_expiry: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(CoveredCall)

    if exchange is not None:
        query = query.filter(CoveredCall.exchange == exchange)

    if contract is not None:
        query = query.filter(CoveredCall.contract == contract)
        
    if ticker is not None:
        query = query.filter(CoveredCall.ticker == ticker.upper())

    if min_expiry is not None:
        query = query.filter(CoveredCall.expiry_date >= _parse_date(min_expiry))

    return (
        query
        .order_by(CoveredCall.expiry_date.asc(), CoveredCall.contract.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

