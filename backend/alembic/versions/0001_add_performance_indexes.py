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
    # Usar try/except para cada operação para evitar falhas se as tabelas não existirem
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Criar índices apenas se as tabelas existirem
    if 'actions' in inspector.get_table_names():
        try:
            op.create_index('ix_actions_player_id', 'actions', ['player_id'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_actions_player_id: {str(e)}")
            
        try:
            op.create_index('ix_actions_terrain_id', 'actions', ['terrain_id'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_actions_terrain_id: {str(e)}")
            
        try:
            op.create_index('ix_actions_timestamp', 'actions', ['timestamp'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_actions_timestamp: {str(e)}")
    else:
        print("Tabela 'actions' não existe, pulando criação dos índices")
        
    if 'terrain_parameters' in inspector.get_table_names():
        try:
            op.create_index('ix_terrain_parameters_terrain_id', 'terrain_parameters', ['terrain_id'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_terrain_parameters_terrain_id: {str(e)}")
    else:
        print("Tabela 'terrain_parameters' não existe, pulando criação do índice")
        
    if 'purchases' in inspector.get_table_names():
        try:
            op.create_index('ix_purchases_player_id', 'purchases', ['player_id'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_purchases_player_id: {str(e)}")
            
        try:
            op.create_index('ix_purchases_shop_item_id', 'purchases', ['shop_item_id'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_purchases_shop_item_id: {str(e)}")
            
        try:
            op.create_index('ix_purchases_created_at', 'purchases', ['created_at'], unique=False)
        except Exception as e:
            print(f"Erro ao criar índice ix_purchases_created_at: {str(e)}")
    else:
        print("Tabela 'purchases' não existe, pulando criação dos índices")

def downgrade():
    # Usar try/except para cada operação para evitar falhas se as tabelas não existirem
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Remover índices apenas se as tabelas existirem
    if 'actions' in inspector.get_table_names():
        try:
            op.drop_index('ix_actions_player_id', table_name='actions')
        except Exception as e:
            print(f"Erro ao remover índice ix_actions_player_id: {str(e)}")
            
        try:
            op.drop_index('ix_actions_terrain_id', table_name='actions')
        except Exception as e:
            print(f"Erro ao remover índice ix_actions_terrain_id: {str(e)}")
            
        try:
            op.drop_index('ix_actions_timestamp', table_name='actions')
        except Exception as e:
            print(f"Erro ao remover índice ix_actions_timestamp: {str(e)}")
    else:
        print("Tabela 'actions' não existe, pulando remoção dos índices")
        
    if 'terrain_parameters' in inspector.get_table_names():
        try:
            op.drop_index('ix_terrain_parameters_terrain_id', table_name='terrain_parameters')
        except Exception as e:
            print(f"Erro ao remover índice ix_terrain_parameters_terrain_id: {str(e)}")
    else:
        print("Tabela 'terrain_parameters' não existe, pulando remoção do índice")
        
    if 'purchases' in inspector.get_table_names():
        try:
            op.drop_index('ix_purchases_player_id', table_name='purchases')
        except Exception as e:
            print(f"Erro ao remover índice ix_purchases_player_id: {str(e)}")
            
        try:
            op.drop_index('ix_purchases_shop_item_id', table_name='purchases')
        except Exception as e:
            print(f"Erro ao remover índice ix_purchases_shop_item_id: {str(e)}")
            
        try:
            op.drop_index('ix_purchases_created_at', table_name='purchases')
        except Exception as e:
            print(f"Erro ao remover índice ix_purchases_created_at: {str(e)}")
    else:
        print("Tabela 'purchases' não existe, pulando remoção dos índices")
