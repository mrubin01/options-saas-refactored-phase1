"""rename and expand covered calls schema v2

Revision ID: cc_schema_v2_20260418
Revises: cc_dte_20260418
Create Date: 2026-04-18
"""

from alembic import op
import sqlalchemy as sa

revision = "cc_schema_v2_20260418"
down_revision = "cc_dte_20260418"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # rename existing columns to the new contract
    op.alter_column("BEST_COVERED_CALLS","rel_std_deviation",new_column_name="coeff_variation",)
    op.alter_column("BEST_COVERED_CALLS","spread_premium_price_and_bid",new_column_name="max_profit",)
    op.alter_column("BEST_COVERED_CALLS","spread_strike_price",new_column_name="otm",)
    op.alter_column("BEST_COVERED_CALLS","ratio_bid_strike",new_column_name="option_yield",)

    # add new fields
    op.add_column("BEST_COVERED_CALLS",sa.Column("max_profit_per_contract", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("moneyness", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("sigma_distance", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("break_even", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("roc", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("tot_return", sa.Float(), nullable=True),)
    op.add_column("BEST_COVERED_CALLS",sa.Column("delta", sa.Float(), nullable=True),)


def downgrade() -> None:
    # drop newly added fields
    op.drop_column("BEST_COVERED_CALLS", "delta")
    op.drop_column("BEST_COVERED_CALLS", "tot_return")
    op.drop_column("BEST_COVERED_CALLS", "roc")
    op.drop_column("BEST_COVERED_CALLS", "break_even")
    op.drop_column("BEST_COVERED_CALLS", "sigma_distance")
    op.drop_column("BEST_COVERED_CALLS", "moneyness")
    op.drop_column("BEST_COVERED_CALLS", "max_profit_per_contract")

    # rename columns back
    op.alter_column("BEST_COVERED_CALLS","option_yield",new_column_name="ratio_bid_strike",)
    op.alter_column("BEST_COVERED_CALLS","otm",new_column_name="spread_strike_price",)
    op.alter_column("BEST_COVERED_CALLS","max_profit",new_column_name="spread_premium_price_and_bid",)
    op.alter_column("BEST_COVERED_CALLS","coeff_variation",new_column_name="rel_std_deviation",)
