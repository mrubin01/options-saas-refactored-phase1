"""add BEST_LONG_CALLS and BEST_LONG_PUTS tables, drop BEST_SPREAD_OPTIONS

Revision ID: long_options_20260802
Revises: watchlist_items_001
Create Date: 2026-08-02
"""

from alembic import op
import sqlalchemy as sa

revision = "long_options_20260802"
down_revision = "watchlist_items_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "BEST_LONG_CALLS",
        sa.Column("contract", sa.String(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("exchange", sa.Integer(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("current_price", sa.Float(), nullable=False),
        sa.Column("strike_price", sa.Float(), nullable=False),
        sa.Column("days_to_expiration", sa.Integer(), nullable=False),
        sa.Column("coeff_variation", sa.Float(), nullable=False),
        sa.Column("otm", sa.Float(), nullable=False),
        sa.Column("moneyness", sa.Float(), nullable=False),
        sa.Column("sigma_distance", sa.Float(), nullable=False),
        sa.Column("ask_per_share", sa.Float(), nullable=False),
        sa.Column("premium_per_contract", sa.Float(), nullable=False),
        sa.Column("spread_bid_ask", sa.Float(), nullable=False),
        sa.Column("break_even", sa.Float(), nullable=False),
        sa.Column("open_interest", sa.Integer(), nullable=True),
        sa.Column("impl_volatility", sa.Float(), nullable=False),
        sa.Column("delta", sa.Float(), nullable=False),
        sa.Column("highest_price", sa.Float(), nullable=False),
        sa.Column("avg_price", sa.Float(), nullable=False),
        sa.Column("lowest_price", sa.Float(), nullable=False),
        sa.Column("main_trend", sa.Integer(), nullable=False),
        sa.Column("beta", sa.Float(), nullable=True),
        sa.Column("sector", sa.String(), nullable=True),
        sa.Column("industry", sa.String(), nullable=True),
        sa.Column("iv_hv_ratio", sa.Float(), nullable=True),
        sa.Column("ex_dividend_date", sa.Date(), nullable=True),
        sa.Column("earnings_date", sa.Date(), nullable=True),
        sa.Column("profit_5pct", sa.Float(), nullable=True),
        sa.Column("return_5pct", sa.Float(), nullable=True),
        sa.Column("profit_10pct", sa.Float(), nullable=True),
        sa.Column("return_10pct", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["exchange"], ["EXCHANGE.exchange_id"], name="fk_long_calls_exchange", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("contract"),
    )
    op.create_index("ix_lc_ticker", "BEST_LONG_CALLS", ["ticker"])
    op.create_index("ix_lc_expiry_date", "BEST_LONG_CALLS", ["expiry_date"])
    op.create_index("ix_lc_ticker_expiry", "BEST_LONG_CALLS", ["ticker", "expiry_date"])
    op.create_index("ix_lc_exchange_ticker_expiry", "BEST_LONG_CALLS", ["exchange", "ticker", "expiry_date"])
    op.create_index("ix_lc_exchange_ticker_expiry_contract", "BEST_LONG_CALLS", ["exchange", "ticker", "expiry_date", "contract"])

    op.create_table(
        "BEST_LONG_PUTS",
        sa.Column("contract", sa.String(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("exchange", sa.Integer(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("current_price", sa.Float(), nullable=False),
        sa.Column("strike_price", sa.Float(), nullable=False),
        sa.Column("days_to_expiration", sa.Integer(), nullable=False),
        sa.Column("coeff_variation", sa.Float(), nullable=False),
        sa.Column("otm", sa.Float(), nullable=False),
        sa.Column("moneyness", sa.Float(), nullable=False),
        sa.Column("sigma_distance", sa.Float(), nullable=False),
        sa.Column("ask_per_share", sa.Float(), nullable=False),
        sa.Column("premium_per_contract", sa.Float(), nullable=False),
        sa.Column("spread_bid_ask", sa.Float(), nullable=False),
        sa.Column("break_even", sa.Float(), nullable=False),
        sa.Column("open_interest", sa.Integer(), nullable=True),
        sa.Column("impl_volatility", sa.Float(), nullable=False),
        sa.Column("delta", sa.Float(), nullable=False),
        sa.Column("highest_price", sa.Float(), nullable=False),
        sa.Column("avg_price", sa.Float(), nullable=False),
        sa.Column("lowest_price", sa.Float(), nullable=False),
        sa.Column("main_trend", sa.Integer(), nullable=False),
        sa.Column("beta", sa.Float(), nullable=True),
        sa.Column("sector", sa.String(), nullable=True),
        sa.Column("industry", sa.String(), nullable=True),
        sa.Column("iv_hv_ratio", sa.Float(), nullable=True),
        sa.Column("ex_dividend_date", sa.Date(), nullable=True),
        sa.Column("earnings_date", sa.Date(), nullable=True),
        sa.Column("profit_5pct", sa.Float(), nullable=True),
        sa.Column("return_5pct", sa.Float(), nullable=True),
        sa.Column("profit_10pct", sa.Float(), nullable=True),
        sa.Column("return_10pct", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["exchange"], ["EXCHANGE.exchange_id"], name="fk_long_puts_exchange", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("contract"),
    )
    op.create_index("ix_lp_ticker", "BEST_LONG_PUTS", ["ticker"])
    op.create_index("ix_lp_expiry_date", "BEST_LONG_PUTS", ["expiry_date"])
    op.create_index("ix_lp_ticker_expiry", "BEST_LONG_PUTS", ["ticker", "expiry_date"])
    op.create_index("ix_lp_exchange_ticker_expiry", "BEST_LONG_PUTS", ["exchange", "ticker", "expiry_date"])
    op.create_index("ix_lp_exchange_ticker_expiry_contract", "BEST_LONG_PUTS", ["exchange", "ticker", "expiry_date", "contract"])

    op.drop_index("ix_so_ticker_expiry", table_name="BEST_SPREAD_OPTIONS")
    op.drop_index("ix_so_exchange_ticker_expiry", table_name="BEST_SPREAD_OPTIONS")
    op.drop_index("ix_so_exchange_ticker_expiry_contract", table_name="BEST_SPREAD_OPTIONS")
    op.drop_table("BEST_SPREAD_OPTIONS")


def downgrade() -> None:
    op.create_table(
        "BEST_SPREAD_OPTIONS",
        sa.Column("contract", sa.String(), nullable=False),
        sa.Column("ticker", sa.String(), nullable=False),
        sa.Column("exchange", sa.Integer(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("current_price", sa.Float(), nullable=False),
        sa.Column("strike_price", sa.Float(), nullable=False),
        sa.Column("days_to_expiration", sa.Integer(), nullable=False),
        sa.Column("coeff_variation", sa.Float(), nullable=False),
        sa.Column("max_profit", sa.Float(), nullable=False),
        sa.Column("max_profit_per_contract", sa.Float(), nullable=False),
        sa.Column("otm", sa.Float(), nullable=False),
        sa.Column("moneyness", sa.Float(), nullable=False),
        sa.Column("sigma_distance", sa.Float(), nullable=False),
        sa.Column("bid_per_share", sa.Float(), nullable=False),
        sa.Column("premium_per_contract", sa.Float(), nullable=False),
        sa.Column("spread_bid_ask", sa.Float(), nullable=False),
        sa.Column("break_even", sa.Float(), nullable=False),
        sa.Column("open_interest", sa.Integer(), nullable=True),
        sa.Column("impl_volatility", sa.Float(), nullable=False),
        sa.Column("option_yield", sa.Float(), nullable=False),
        sa.Column("roc", sa.Float(), nullable=False),
        sa.Column("tot_return", sa.Float(), nullable=False),
        sa.Column("delta", sa.Float(), nullable=False),
        sa.Column("highest_price", sa.Float(), nullable=False),
        sa.Column("avg_price", sa.Float(), nullable=False),
        sa.Column("lowest_price", sa.Float(), nullable=False),
        sa.Column("main_trend", sa.Integer(), nullable=False),
        sa.Column("beta", sa.Float(), nullable=True),
        sa.Column("sector", sa.String(), nullable=True),
        sa.Column("industry", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["exchange"], ["EXCHANGE.exchange_id"], name="fk_spread_options_exchange", ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("contract"),
    )
    op.create_index("ix_so_ticker_expiry", "BEST_SPREAD_OPTIONS", ["ticker", "expiry_date"])
    op.create_index("ix_so_exchange_ticker_expiry", "BEST_SPREAD_OPTIONS", ["exchange", "ticker", "expiry_date"])
    op.create_index("ix_so_exchange_ticker_expiry_contract", "BEST_SPREAD_OPTIONS", ["exchange", "ticker", "expiry_date", "contract"])

    op.drop_index("ix_lp_exchange_ticker_expiry_contract", table_name="BEST_LONG_PUTS")
    op.drop_index("ix_lp_exchange_ticker_expiry", table_name="BEST_LONG_PUTS")
    op.drop_index("ix_lp_ticker_expiry", table_name="BEST_LONG_PUTS")
    op.drop_index("ix_lp_expiry_date", table_name="BEST_LONG_PUTS")
    op.drop_index("ix_lp_ticker", table_name="BEST_LONG_PUTS")
    op.drop_table("BEST_LONG_PUTS")

    op.drop_index("ix_lc_exchange_ticker_expiry_contract", table_name="BEST_LONG_CALLS")
    op.drop_index("ix_lc_exchange_ticker_expiry", table_name="BEST_LONG_CALLS")
    op.drop_index("ix_lc_ticker_expiry", table_name="BEST_LONG_CALLS")
    op.drop_index("ix_lc_expiry_date", table_name="BEST_LONG_CALLS")
    op.drop_index("ix_lc_ticker", table_name="BEST_LONG_CALLS")
    op.drop_table("BEST_LONG_CALLS")
