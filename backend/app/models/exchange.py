from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Exchange(Base):
    __tablename__ = "EXCHANGE"

    exchange_id = Column(Integer, primary_key=True, index=True)
    exchange_name = Column(String, nullable=False, unique=True)

