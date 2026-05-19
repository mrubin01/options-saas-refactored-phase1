"""add days_to_expiration to covered calls

Revision ID: cc_dte_20260418
Revises: saved_screeners_001
Create Date: 2026-04-18
"""

from alembic import op
import sqlalchemy as sa

revision = "cc_dte_20260418"
down_revision = "saved_screeners_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "BEST_COVERED_CALLS",
        sa.Column("days_to_expiration", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("BEST_COVERED_CALLS", "days_to_expiration")
