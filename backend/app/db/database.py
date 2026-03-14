from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
from app.core.config import settings

# uvicorn and fastapi use read-only user  
DATABASE_URL_ADMIN = settings.DATABASE_URL_ADMIN
DATABASE_URL_APP = settings.DATABASE_URL_APP

if not DATABASE_URL_ADMIN:
    raise RuntimeError("DATABASE_URL_ADMIN is not set")

# ─────────────────────────────────────────────
# SQLAlchemy Engine with connection pooling
# ─────────────────────────────────────────────

engine: Engine = create_engine(
    DATABASE_URL_ADMIN,
    pool_size=10,          # max persistent connections
    max_overflow=20,       # extra temporary connections
    pool_timeout=30,       # seconds to wait for a connection
    pool_recycle=1800,     # recycle connections every 30 min
    pool_pre_ping=True,    # detect stale connections
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
