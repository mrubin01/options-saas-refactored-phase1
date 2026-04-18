"""expand put options fields

Revision ID: po_fields_20260418
Revises: expand covered calls fields
Create Date: 2026-04-18
"""

from alembic import op
import sqlalchemy as sa

revision = "po_fields_20260418"
down_revision = "cc_fields_20260414"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("BEST_PUT_OPTIONS", sa.Column("rel_std_deviation", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("spread_premium_price_and_bid", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("spread_strike_price", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("bid_per_share", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("premium_per_contract", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("spread_bid_ask", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("open_interest", sa.Integer(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("impl_volatility", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("ratio_bid_strike", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("sector", sa.String(length=255), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("industry", sa.String(length=255), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("highest_price", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("avg_price", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("lowest_price", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("main_trend", sa.Integer(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("beta", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("BEST_PUT_OPTIONS", "beta")
    op.drop_column("BEST_PUT_OPTIONS", "main_trend")
    op.drop_column("BEST_PUT_OPTIONS", "lowest_price")
    op.drop_column("BEST_PUT_OPTIONS", "avg_price")
    op.drop_column("BEST_PUT_OPTIONS", "highest_price")
    op.drop_column("BEST_PUT_OPTIONS", "industry")
    op.drop_column("BEST_PUT_OPTIONS", "sector")
    op.drop_column("BEST_PUT_OPTIONS", "ratio_bid_strike")
    op.drop_column("BEST_PUT_OPTIONS", "impl_volatility")
    op.drop_column("BEST_PUT_OPTIONS", "open_interest")
    op.drop_column("BEST_PUT_OPTIONS", "spread_bid_ask")
    op.drop_column("BEST_PUT_OPTIONS", "premium_per_contract")
    op.drop_column("BEST_PUT_OPTIONS", "bid_per_share")
    op.drop_column("BEST_PUT_OPTIONS", "spread_strike_price")
    op.drop_column("BEST_PUT_OPTIONS", "spread_premium_price_and_bid")
    op.drop_column("BEST_PUT_OPTIONS", "rel_std_deviation")
    