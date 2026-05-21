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
    pass


def downgrade() -> None:
    pass
