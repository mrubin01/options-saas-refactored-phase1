"""add days_to_expiration to put options

Revision ID: po_dte_20260418
Revises: po_schema_v2_20260418
Create Date: 2026-04-18
"""

from alembic import op
import sqlalchemy as sa

revision = "po_dte_20260418"
down_revision = "po_schema_v2_20260418"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "BEST_PUT_OPTIONS",
        sa.Column("days_to_expiration", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("BEST_PUT_OPTIONS", "days_to_expiration")
