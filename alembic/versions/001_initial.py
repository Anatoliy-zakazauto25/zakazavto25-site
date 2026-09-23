"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2026-09-14 12:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create managers table
    op.create_table(
        'managers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('telegram_id', sa.BigInteger(), nullable=False, unique=True),
        sa.Column('username', sa.String(255), nullable=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('current_leads_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_leads_processed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )
    op.create_index('ix_managers_telegram_id', 'managers', ['telegram_id'])
    op.create_index('ix_managers_is_active', 'managers', ['is_active'])
    
    # Create leads table
    op.create_table(
        'leads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('external_id', sa.String(255), nullable=True, unique=True),
        sa.Column('client_name', sa.String(255), nullable=False),
        sa.Column('client_phone', sa.String(50), nullable=False),
        sa.Column('client_telegram', sa.String(255), nullable=True),
        sa.Column('service', sa.String(255), nullable=False),
        sa.Column('car_brand', sa.String(255), nullable=True),
        sa.Column('car_model', sa.String(255), nullable=True),
        sa.Column('budget', sa.String(100), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('utm_source', sa.String(255), nullable=True),
        sa.Column('utm_medium', sa.String(255), nullable=True),
        sa.Column('utm_campaign', sa.String(255), nullable=True),
        sa.Column('utm_content', sa.String(255), nullable=True),
        sa.Column('utm_term', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='NEW'),
        sa.Column('assigned_manager_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('telegram_message_id', sa.BigInteger(), nullable=True),
        sa.Column('chat_message_id', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['assigned_manager_id'], ['managers.id'], ondelete='SET NULL')
    )
    op.create_index('ix_leads_external_id', 'leads', ['external_id'])
    op.create_index('ix_leads_status', 'leads', ['status'])
    op.create_index('ix_leads_assigned_manager_id', 'leads', ['assigned_manager_id'])
    op.create_index('ix_leads_created_at', 'leads', ['created_at'])
    
    # Create lead_history table
    op.create_table(
        'lead_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lead_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('manager_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['manager_id'], ['managers.id'], ondelete='SET NULL')
    )
    op.create_index('ix_lead_history_lead_id', 'lead_history', ['lead_id'])
    op.create_index('ix_lead_history_created_at', 'lead_history', ['created_at'])
    
    # Create lead_comments table
    op.create_table(
        'lead_comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lead_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('manager_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('comment', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['manager_id'], ['managers.id'], ondelete='CASCADE')
    )
    op.create_index('ix_lead_comments_lead_id', 'lead_comments', ['lead_id'])
    
    # Create settings table
    op.create_table(
        'settings',
        sa.Column('key', sa.String(255), primary_key=True),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )


def downgrade() -> None:
    op.drop_table('settings')
    op.drop_table('lead_comments')
    op.drop_table('lead_history')
    op.drop_table('leads')
    op.drop_table('managers')
