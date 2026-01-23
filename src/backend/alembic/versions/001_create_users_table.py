"""create users table

Revision ID: 001
Revises: 
Create Date: 2026-01-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('phone', sa.String(15), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_email_verified', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_phone_verified', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_profile_complete', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('terms_accepted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_phone', 'users', ['phone'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])


def downgrade():
    op.drop_index('ix_users_created_at', 'users')
    op.drop_index('ix_users_phone', 'users')
    op.drop_index('ix_users_email', 'users')
    op.drop_table('users')
