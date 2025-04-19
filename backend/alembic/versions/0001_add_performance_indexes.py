"""
add performance indexes

Revision ID: 0001_add_performance_indexes
Revises: 
Create Date: 2025-04-18 19:00:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_add_performance_indexes'
down_revision = None
depends_on = None
branch_labels = None

def upgrade():
    op.create_index('ix_actions_player_id', 'actions', ['player_id'], unique=False)
    op.create_index('ix_actions_terrain_id', 'actions', ['terrain_id'], unique=False)
    op.create_index('ix_actions_timestamp', 'actions', ['timestamp'], unique=False)
    op.create_index('ix_terrain_parameters_terrain_id', 'terrain_parameters', ['terrain_id'], unique=False)
    op.create_index('ix_purchases_player_id', 'purchases', ['player_id'], unique=False)
    op.create_index('ix_purchases_shop_item_id', 'purchases', ['shop_item_id'], unique=False)
    op.create_index('ix_purchases_created_at', 'purchases', ['created_at'], unique=False)

def downgrade():
    op.drop_index('ix_actions_player_id', table_name='actions')
    op.drop_index('ix_actions_terrain_id', table_name='actions')
    op.drop_index('ix_actions_timestamp', table_name='actions')
    op.drop_index('ix_terrain_parameters_terrain_id', table_name='terrain_parameters')
    op.drop_index('ix_purchases_player_id', table_name='purchases')
    op.drop_index('ix_purchases_shop_item_id', table_name='purchases')
    op.drop_index('ix_purchases_created_at', table_name='purchases')
