"""fix_table_creation_order

Revision ID: 999999_fix_table_creation_order
Revises: ea507d6eba83_add_heads_and_bodies_tables_for_
Create Date: 2025-05-21 19:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '999999_fix_table_creation_order'
down_revision = '999999'
branch_labels = None
depends_on = None


def upgrade():
    # Recriação de tabelas na ordem correta para resolver dependências
    
    # Verificar se a tabela terrains existe, se não, criar primeiro
    if not op.get_bind().dialect.has_table(op.get_bind(), 'terrains'):
        op.create_table('terrains',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Criar quadrants se não existir
    if not op.get_bind().dialect.has_table(op.get_bind(), 'quadrants'):
        op.create_table('quadrants',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('terrain_id', sa.Integer(), nullable=False),
            sa.Column('label', sa.String(), nullable=False),
            sa.Column('soil_moisture', sa.Float(), nullable=True, default=0.0),
            sa.Column('fertility', sa.Integer(), nullable=True, default=0),
            sa.Column('coverage', sa.Float(), nullable=True, default=0.0),
            sa.Column('organic_matter', sa.Integer(), nullable=True, default=0),
            sa.Column('compaction', sa.Integer(), nullable=True, default=0),
            sa.Column('biodiversity', sa.Integer(), nullable=True, default=0),
            sa.ForeignKeyConstraint(['terrain_id'], ['terrains.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_quadrants_id'), 'quadrants', ['id'], unique=False)
        op.create_index(op.f('ix_quadrants_terrain_id'), 'quadrants', ['terrain_id'], unique=False)
    
    # Verifica se species existe, se não, cria
    if not op.get_bind().dialect.has_table(op.get_bind(), 'species'):
        op.create_table('species',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('scientific_name', sa.String(), nullable=True),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('growth_time', sa.Integer(), nullable=False),
            sa.Column('water_need', sa.Integer(), nullable=False),
            sa.Column('sun_need', sa.Integer(), nullable=False),
            sa.Column('yield_min', sa.Integer(), nullable=False),
            sa.Column('yield_max', sa.Integer(), nullable=False),
            sa.Column('season', sa.String(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_species_id'), 'species', ['id'], unique=False)
    
    # Verifica se players existe, se não, cria
    if not op.get_bind().dialect.has_table(op.get_bind(), 'players'):
        op.create_table('players',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_players_id'), 'players', ['id'], unique=False)
        op.create_index(op.f('ix_players_user_id'), 'players', ['user_id'], unique=False)
    
    # Finalmente, cria a tabela plantings se não existir (dependente de quadrants)
    enum_type = sa.Enum('SEMENTE', 'MUDINHA', 'MADURA', 'COLHIVEL', 'COLHIDA', 'MORTA', name='plant_state')
    
    if not op.get_bind().dialect.has_type(op.get_bind(), 'plant_state'):
        enum_type.create(op.get_bind())
    
    if not op.get_bind().dialect.has_table(op.get_bind(), 'plantings'):
        op.create_table('plantings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('species_id', sa.Integer(), nullable=False),
            sa.Column('player_id', sa.Integer(), nullable=False),
            sa.Column('quadrant_id', sa.Integer(), nullable=False),
            sa.Column('slot_index', sa.Integer(), nullable=False),
            sa.Column('planted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('current_state', sa.Enum('SEMENTE', 'MUDINHA', 'MADURA', 'COLHIVEL', 'COLHIDA', 'MORTA', name='plant_state'), nullable=False, default='SEMENTE'),
            sa.Column('days_since_planting', sa.Integer(), nullable=True, default=0),
            sa.Column('days_sem_rega', sa.Integer(), nullable=True, default=0),
            sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
            sa.ForeignKeyConstraint(['quadrant_id'], ['quadrants.id'], ),
            sa.ForeignKeyConstraint(['species_id'], ['species.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('quadrant_id', 'slot_index', name='uix_quadrant_slot')
        )
        op.create_index(op.f('ix_plantings_id'), 'plantings', ['id'], unique=False)


def downgrade():
    # Se precisar reverter, remova as tabelas na ordem inversa
    # Primeiro, plantings
    op.drop_table('plantings')
    
    # Depois, pode remover as outras se necessário
    # op.drop_table('quadrants')
    # op.drop_table('species')
    # op.drop_table('players')
    # op.drop_table('terrains')
    
    # Remover o tipo enum
    sa.Enum(name='plant_state').drop(op.get_bind(), checkfirst=True)
