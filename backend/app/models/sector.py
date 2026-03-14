from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Sector(Base):
    __tablename__ = "SECTOR"

    sector_id = Column(Integer, primary_key=True)
    sector_name = Column(String, nullable=False, unique=True, index=True)

