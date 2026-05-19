"""add saved screeners table

Revision ID: saved_screeners_001
Revises: cc_fields_20260517
Create Date: 2026-05-18
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "saved_screeners_001"
down_revision = "cc_fields_20260517"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "SAVED_SCREENERS",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("strategy_type", sa.String(length=40), nullable=False),
        sa.Column("config_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["USERS.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "user_id",
            "strategy_type",
            "name",
            name="uq_saved_screeners_user_strategy_name",
        ),
    )

    op.create_index("ix_saved_screeners_user_id", "SAVED_SCREENERS", ["user_id"])
    op.create_index(
        "ix_saved_screeners_user_strategy",
        "SAVED_SCREENERS",
        ["user_id", "strategy_type"],
    )


def downgrade() -> None:
    op.drop_index("ix_saved_screeners_user_strategy", table_name="SAVED_SCREENERS")
    op.drop_index("ix_saved_screeners_user_id", table_name="SAVED_SCREENERS")
    op.drop_table("SAVED_SCREENERS")
