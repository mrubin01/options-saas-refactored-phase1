"""rename and expand put options schema v2

Revision ID: po_schema_v2_20260418
Revises: cc_schema_v2_20260418
Create Date: 2026-04-18
"""

from alembic import op
import sqlalchemy as sa

revision = "po_schema_v2_20260418"
down_revision = "cc_schema_v2_20260418"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # rename existing columns to the new contract
    op.alter_column("BEST_PUT_OPTIONS","rel_std_deviation",new_column_name="coeff_variation",)
    op.alter_column("BEST_PUT_OPTIONS","spread_premium_price_and_bid",new_column_name="max_profit",)
    op.alter_column("BEST_PUT_OPTIONS","spread_strike_price",new_column_name="otm",)
    op.alter_column("BEST_PUT_OPTIONS","ratio_bid_strike",new_column_name="option_yield",)

    # add new fields
    op.add_column("BEST_PUT_OPTIONS",sa.Column("max_profit_per_contract", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("moneyness", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("sigma_distance", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("break_even", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("roc", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("tot_return", sa.Float(), nullable=True),)
    op.add_column("BEST_PUT_OPTIONS",sa.Column("delta", sa.Float(), nullable=True),)


def downgrade() -> None:
    # drop newly added fields
    op.drop_column("BEST_PUT_OPTIONS", "delta")
    op.drop_column("BEST_PUT_OPTIONS", "tot_return")
    op.drop_column("BEST_PUT_OPTIONS", "roc")
    op.drop_column("BEST_PUT_OPTIONS", "break_even")
    op.drop_column("BEST_PUT_OPTIONS", "sigma_distance")
    op.drop_column("BEST_PUT_OPTIONS", "moneyness")
    op.drop_column("BEST_PUT_OPTIONS", "max_profit_per_contract")

    # rename columns back
    op.alter_column("BEST_PUT_OPTIONS","option_yield",new_column_name="ratio_bid_strike",)
    op.alter_column("BEST_PUT_OPTIONS","otm",new_column_name="spread_strike_price",)
    op.alter_column("BEST_PUT_OPTIONS","max_profit",new_column_name="spread_premium_price_and_bid",)
    op.alter_column("BEST_PUT_OPTIONS","coeff_variation",new_column_name="rel_std_deviation",)

