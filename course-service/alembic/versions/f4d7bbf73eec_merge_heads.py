"""merge heads

Revision ID: f4d7bbf73eec
Revises: 88d01d87d974, add_missing_columns
Create Date: 2025-03-22 17:44:31.098745

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f4d7bbf73eec'
down_revision = ('88d01d87d974', 'add_missing_columns')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 