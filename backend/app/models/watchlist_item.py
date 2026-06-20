from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func

from app.db.database import Base


class WatchlistItem(Base):
    __tablename__ = "WATCHLIST_ITEMS"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(
        Integer,
        ForeignKey("USERS.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    strategy_type = Column(String(40), nullable=False)
    contract = Column(String(64), nullable=False)
    ticker = Column(String(32), nullable=False)
    exchange = Column(Integer, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "strategy_type",
            "contract",
            name="uq_watchlist_user_strategy_contract",
        ),
        Index("ix_watchlist_user_strategy", "user_id", "strategy_type"),
    )
    