from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Index, DateTime
from app.db.database import Base
from sqlalchemy.sql import func

class CoveredCall(Base):
    __tablename__ = "BEST_COVERED_CALLS"

    contract = Column(String, primary_key=True)
    ticker = Column(String, nullable=False, index=True)
    exchange = Column(
    Integer,
    ForeignKey(
        "EXCHANGE.exchange_id",
        name="fk_covered_calls_exchange",
        ondelete="RESTRICT",
    ),
    nullable=False,
    )
    # exchange = Column(Integer, nullable=False, default=0)
    expiry_date = Column(Date, nullable=False, index=True)
    current_price = Column(Float, nullable=False)
    strike_price = Column(Float, nullable=False)

    rel_std_deviation = Column(Float, nullable=False)
    spread_premium_price_and_bid = Column(Float, nullable=False)
    spread_strike_price = Column(Float, nullable=False)
    bid_per_share = Column(Float, nullable=False)
    premium_per_contract = Column(Float, nullable=False)
    spread_bid_ask = Column(Float, nullable=False)
    open_interest = Column(Integer, nullable=True)
    impl_volatility = Column(Float, nullable=False)
    ratio_bid_strike = Column(Float, nullable=False)
    highest_price = Column(Float, nullable=False)
    avg_price = Column(Float, nullable=False)
    lowest_price = Column(Float, nullable=False)
    main_trend = Column(Integer, nullable=False)

    beta = Column(Float, nullable=True)
    sector = Column(String, nullable=True)
    industry = Column(String, nullable=True)


    updated_at = Column(DateTime(timezone=True), 
                        server_default=func.now(),
                        onupdate=func.now(),
                        nullable=False)

    __table_args__ = (
        Index("ix_cc_ticker_expiry", "ticker", "expiry_date"),
        Index("ix_cc_exchange_ticker_expiry", "exchange", "ticker", "expiry_date"),
        Index("ix_cc_exchange_ticker_expiry_contract", "exchange", "ticker", "expiry_date", "contract"),
    )
