"""expand covered calls fields

Revision ID: cc_fields_20260414
Revises: add_account_lifecycle_001
Create Date: 2026-04-14
"""

from alembic import op
import sqlalchemy as sa

revision = "cc_fields_20260414"
down_revision = "add_account_lifecycle_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("BEST_COVERED_CALLS", sa.Column("rel_std_deviation", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("spread_premium_price_and_bid", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("spread_strike_price", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("bid_per_share", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("premium_per_contract", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("spread_bid_ask", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("open_interest", sa.Integer(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("impl_volatility", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("ratio_bid_strike", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("sector", sa.String(length=255), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("industry", sa.String(length=255), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("highest_price", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("avg_price", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("lowest_price", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("main_trend", sa.Integer(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("beta", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("BEST_COVERED_CALLS", "beta")
    op.drop_column("BEST_COVERED_CALLS", "main_trend")
    op.drop_column("BEST_COVERED_CALLS", "lowest_price")
    op.drop_column("BEST_COVERED_CALLS", "avg_price")
    op.drop_column("BEST_COVERED_CALLS", "highest_price")
    op.drop_column("BEST_COVERED_CALLS", "industry")
    op.drop_column("BEST_COVERED_CALLS", "sector")
    op.drop_column("BEST_COVERED_CALLS", "ratio_bid_strike")
    op.drop_column("BEST_COVERED_CALLS", "impl_volatility")
    op.drop_column("BEST_COVERED_CALLS", "open_interest")
    op.drop_column("BEST_COVERED_CALLS", "spread_bid_ask")
    op.drop_column("BEST_COVERED_CALLS", "premium_per_contract")
    op.drop_column("BEST_COVERED_CALLS", "bid_per_share")
    op.drop_column("BEST_COVERED_CALLS", "spread_strike_price")
    op.drop_column("BEST_COVERED_CALLS", "spread_premium_price_and_bid")
    op.drop_column("COVERED_CALLS", "rel_std_deviation")
    