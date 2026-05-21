"""expand covered calls fields

Revision ID: cc_fields_20260517
Revises: expand spread options fields
Create Date: 2026-05-17
"""

from alembic import op
import sqlalchemy as sa

revision = "cc_fields_20260517"
down_revision = "so_fields_20260419"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("BEST_COVERED_CALLS", sa.Column("coeff_variation", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("max_profit", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("max_profit_per_contract", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("otm", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("moneyness", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("sigma_distance", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("break_even", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("option_yield", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("roc", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("tot_return", sa.Float(), nullable=True))
    op.add_column("BEST_COVERED_CALLS", sa.Column("delta", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("BEST_COVERED_CALLS", "delta")
    op.drop_column("BEST_COVERED_CALLS", "tot_return")
    op.drop_column("BEST_COVERED_CALLS", "roc")
    op.drop_column("BEST_COVERED_CALLS", "option_yield")
    op.drop_column("BEST_COVERED_CALLS", "break_even")
    op.drop_column("BEST_COVERED_CALLS", "sigma_distance")
    op.drop_column("BEST_COVERED_CALLS", "moneyness")
    op.drop_column("BEST_COVERED_CALLS", "otm")
    op.drop_column("BEST_COVERED_CALLS", "max_profit_per_contract")
    op.drop_column("BEST_COVERED_CALLS", "max_profit")
    op.drop_column("BEST_COVERED_CALLS", "coeff_variation")



