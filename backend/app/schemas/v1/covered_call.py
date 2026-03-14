from datetime import date, datetime
from pydantic import BaseModel
from typing import List

# response schema: data to expose via API   

class CoveredCallBase(BaseModel):
    contract: str
    ticker: str
    exchange: int
    expiry_date: date
    current_price: float
    strike_price: float
    updated_at: datetime | None = None

class CoveredCallOut(CoveredCallBase):
    class Config:
        orm_mode = True

class CoveredCallsList(BaseModel):
    items: List[CoveredCallOut]
    limit: int
    offset: int
