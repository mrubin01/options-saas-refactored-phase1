"""add iv_hv_ratio, ex_dividend_date, earnings_date to sell-side tables

Revision ID: sell_side_fields_20260802
Revises: long_options_20260802
Create Date: 2026-08-02
"""

from alembic import op
import sqlalchemy as sa

revision = "sell_side_fields_20260802"
down_revision = "long_options_20260802"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("BEST_COVERED_CALLS", sa.Column("iv_hv_ratio", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("ex_dividend_date", sa.Date(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("earnings_date", sa.Date(), nullable=True))

    op.add_column("BEST_PUT_OPTIONS", sa.Column("iv_hv_ratio", sa.Float(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("ex_dividend_date", sa.Date(), nullable=True))
    op.add_column("BEST_PUT_OPTIONS", sa.Column("earnings_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("BEST_PUT_OPTIONS", "earnings_date")
    op.drop_column("BEST_PUT_OPTIONS", "ex_dividend_date")
    op.drop_column("BEST_PUT_OPTIONS", "iv_hv_ratio")

    op.drop_column("BEST_COVERED_CALLS", "earnings_date")
    op.drop_column("BEST_COVERED_CALLS", "ex_dividend_date")
    op.drop_column("BEST_COVERED_CALLS", "iv_hv_ratio")
