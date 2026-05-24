"""add watchlist items table

Revision ID: watchlist_items_001
Revises: so_schema_v2_20260418
Create Date: 2026-05-24
"""

from alembic import op
import sqlalchemy as sa

revision = "watchlist_items_001"
down_revision = "so_schema_v2_20260418"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "WATCHLIST_ITEMS",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("strategy_type", sa.String(length=40), nullable=False),
        sa.Column("contract", sa.String(length=64), nullable=False),
        sa.Column("ticker", sa.String(length=32), nullable=False),
        sa.Column("exchange", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["USERS.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "user_id",
            "strategy_type",
            "contract",
            name="uq_watchlist_user_strategy_contract",
        ),
    )

    op.create_index("ix_watchlist_user_id", "WATCHLIST_ITEMS", ["user_id"])
    op.create_index("ix_watchlist_user_strategy", "WATCHLIST_ITEMS", ["user_id", "strategy_type"])


def downgrade() -> None:
    op.drop_index("ix_watchlist_user_strategy", table_name="WATCHLIST_ITEMS")
    op.drop_index("ix_watchlist_user_id", table_name="WATCHLIST_ITEMS")
    op.drop_table("WATCHLIST_ITEMS")
