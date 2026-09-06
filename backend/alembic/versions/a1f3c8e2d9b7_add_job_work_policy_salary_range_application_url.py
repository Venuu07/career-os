"""add_job_work_policy_salary_range_application_url

Adds three new optional fields to the jobs table:
  - work_policy: enum (ONSITE, REMOTE, HYBRID) — nullable
    Uses UPPERCASE values to match the existing enum convention
    (job_type: FULL_TIME, job_status: DRAFT/OPEN/CLOSED, etc.)
  - salary_range: varchar(100) — nullable, human-readable string
  - application_url: varchar(2048) — nullable, direct link to ATS/form

Also creates the work_policy Postgres enum type.

All columns are nullable and have no default, so existing rows are
unaffected (they will have NULL for these fields).

Revision ID: a1f3c8e2d9b7
Revises: 4852d64316e9
Create Date: 2026-09-06
"""

from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op


revision: str = 'a1f3c8e2d9b7'
down_revision: Union[str, Sequence[str], None] = '4852d64316e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the work_policy enum type in Postgres
    # Use UPPERCASE values to match the existing enum convention in this project
    # (see job_type: FULL_TIME, job_status: DRAFT/OPEN/CLOSED, etc.)
    work_policy_enum = sa.Enum(
        'ONSITE', 'REMOTE', 'HYBRID',
        name='work_policy',
    )
    work_policy_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        'jobs',
        sa.Column(
            'work_policy',
            sa.Enum('ONSITE', 'REMOTE', 'HYBRID', name='work_policy', create_type=False),
            nullable=True,
        ),
    )
    op.add_column(
        'jobs',
        sa.Column('salary_range', sa.String(100), nullable=True),
    )
    op.add_column(
        'jobs',
        sa.Column('application_url', sa.String(2048), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('jobs', 'application_url')
    op.drop_column('jobs', 'salary_range')
    op.drop_column('jobs', 'work_policy')

    # Drop the enum type from Postgres
    work_policy_enum = sa.Enum(name='work_policy')
    work_policy_enum.drop(op.get_bind(), checkfirst=True)
