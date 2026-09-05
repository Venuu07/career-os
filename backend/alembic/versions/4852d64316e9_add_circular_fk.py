"""add_circular_fk

Adds the deferred circular FK:
  careers_pages.published_version_id → career_page_versions.id

This FK could not be included in the initial_schema migration because
career_page_versions did not exist when careers_pages was created.
The use_alter=True pattern in the ORM model marks it for post-creation
via ALTER TABLE. Alembic autogenerate did not emit it, so it's added here.

Revision ID: 4852d64316e9
Revises: 3de76149c0b1
Create Date: 2026-09-05
"""

from typing import Sequence, Union
from alembic import op

revision: str = '4852d64316e9'
down_revision: Union[str, Sequence[str], None] = '3de76149c0b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_foreign_key(
        'fk_careers_pages_published_version',
        'careers_pages',
        'career_page_versions',
        ['published_version_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_careers_pages_published_version', 'careers_pages', type_='foreignkey')
