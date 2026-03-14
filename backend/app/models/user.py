from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from app.db.database import Base

class User(Base):
    __tablename__ = "USERS"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

