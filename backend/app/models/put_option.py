from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Index, DateTime
from app.db.database import Base
from sqlalchemy.sql import func

class PutOption(Base):
    __tablename__ = "BEST_PUT_OPTIONS"

    contract = Column(String, primary_key=True)
    ticker = Column(String, nullable=False, index=True)
    exchange = Column(
    Integer,
    ForeignKey(
        "EXCHANGE.exchange_id",
        name="fk_put_options_exchange",
        ondelete="RESTRICT",
    ),
    nullable=False,
    )
    expiry_date = Column(Date, nullable=False, index=True)
    current_price = Column(Float, nullable=False)
    strike_price = Column(Float, nullable=False)

    days_to_expiration = Column(Integer, nullable=False)
    coeff_variation = Column(Float, nullable=False)
    max_profit = Column(Float, nullable=False)
    max_profit_per_contract = Column(Float, nullable=False)
    otm = Column(Float, nullable=False)
    moneyness = Column(Float, nullable=False)
    sigma_distance = Column(Float, nullable=False)
    bid_per_share = Column(Float, nullable=False)
    premium_per_contract = Column(Float, nullable=False)
    spread_bid_ask = Column(Float, nullable=False)
    break_even = Column(Float, nullable=False)
    open_interest = Column(Integer, nullable=True)
    impl_volatility = Column(Float, nullable=False)
    option_yield = Column(Float, nullable=False)
    roc = Column(Float, nullable=False)
    tot_return = Column(Float, nullable=False)
    delta = Column(Float, nullable=False)
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
        Index("ix_po_ticker_expiry", "ticker", "expiry_date"),
        Index("ix_po_exchange_ticker_expiry", "exchange", "ticker", "expiry_date"),
        Index("ix_po_exchange_ticker_expiry_contract", "exchange", "ticker", "expiry_date", "contract")
    )
