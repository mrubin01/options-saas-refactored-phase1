"""add account lifecycle tables

Revision ID: add_account_lifecycle_001
Revises: 20260323_add_refresh_sessions.py
Create Date: 2026-03-29
"""

from alembic import op
import sqlalchemy as sa

revision = "add_account_lifecycle_001"
down_revision = "add_refresh_sessions_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("USERS", sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("USERS", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("USERS", sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "AUTH_TOKENS",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("token_type", sa.String(length=32), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["USERS.id"], ondelete="CASCADE"),
    )

    op.create_index("ix_auth_tokens_user_id", "AUTH_TOKENS", ["user_id"])
    op.create_index("ix_auth_tokens_token_hash", "AUTH_TOKENS", ["token_hash"], unique=True)
    op.create_index("ix_auth_tokens_token_type", "AUTH_TOKENS", ["token_type"])


def downgrade() -> None:
    op.drop_index("ix_auth_tokens_token_type", table_name="AUTH_TOKENS")
    op.drop_index("ix_auth_tokens_token_hash", table_name="AUTH_TOKENS")
    op.drop_index("ix_auth_tokens_user_id", table_name="AUTH_TOKENS")
    op.drop_table("AUTH_TOKENS")

    op.drop_column("USERS", "created_at")
    op.drop_column("USERS", "email_verified_at")
    op.drop_column("USERS", "is_email_verified")
