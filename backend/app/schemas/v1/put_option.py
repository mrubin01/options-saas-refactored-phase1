from datetime import date, datetime
from pydantic import BaseModel
from typing import List

# response schema: data to expose via API   

class PutOptionBase(BaseModel):
    contract: str
    ticker: str
    exchange: int
    expiry_date: date
    current_price: float
    strike_price: float
    updated_at: datetime | None = None

class PutOptionOut(PutOptionBase):
    class Config:
        orm_mode = True

class PutOptionList(BaseModel):
    items: List[PutOptionOut]
    limit: int
    offset: int
