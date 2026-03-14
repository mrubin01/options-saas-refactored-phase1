from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Trend(Base):
    __tablename__ = "TREND"

    trend_id = Column(Integer, primary_key=True)
    trend_name = Column(String, nullable=False, unique=True, index=True)

