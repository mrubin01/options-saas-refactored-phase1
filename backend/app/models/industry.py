from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Industry(Base):
    __tablename__ = "INDUSTRY"

    industry_id = Column(Integer, primary_key=True)
    industry_name = Column(String, nullable=False, unique=True, index=True)

