"""add profile fields to users

Revision ID: 002
Revises: 001
Create Date: 2026-01-23 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add profile fields to users table
    op.add_column('users', sa.Column('full_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('medical_registration_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('qualification', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('specialization', sa.String(100), nullable=True))

    # Create unique index for medical_registration_number (partial - only when not null)
    op.create_index(
        'ix_users_medical_registration_number',
        'users',
        ['medical_registration_number'],
        unique=True,
        postgresql_where=sa.text('medical_registration_number IS NOT NULL')
    )


def downgrade():
    op.drop_index('ix_users_medical_registration_number', 'users')
    op.drop_column('users', 'specialization')
    op.drop_column('users', 'qualification')
    op.drop_column('users', 'medical_registration_number')
    op.drop_column('users', 'full_name')
