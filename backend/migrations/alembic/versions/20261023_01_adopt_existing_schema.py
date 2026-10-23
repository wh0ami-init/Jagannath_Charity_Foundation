"""Adopt the existing application schema into Alembic tracking.

Revision ID: 20261023_01
Revises:
Create Date: 2026-10-23
"""

from typing import Sequence, Union

from alembic import op

from app.schema import ensure_database_schema


revision: str = "20261023_01"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create missing tables and safely add the same legacy columns previously
    # applied during app startup. Existing rows and tables are preserved.
    ensure_database_schema(op.get_bind())


def downgrade() -> None:
    # This revision adopts pre-existing production data. Dropping those tables
    # would be destructive, so rolling back the baseline intentionally does
    # not delete application data.
    pass
