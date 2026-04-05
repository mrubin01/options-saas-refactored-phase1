from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine

from app.core.config import settings

DATABASE_URL_ADMIN = settings.DATABASE_URL_ADMIN
DATABASE_URL_APP = settings.DATABASE_URL_APP

if not DATABASE_URL_APP:
    raise RuntimeError("DATABASE_URL_APP is not set")

engine: Engine = create_engine(
    DATABASE_URL_APP,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
