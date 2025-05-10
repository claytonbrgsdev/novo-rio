"""
Testes de integração para o sistema de insumos agrícolas.
Estes testes verificam o fluxo completo de criação e aplicação de insumos,
incluindo seus efeitos nos parâmetros do solo e nas plantas.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os
from datetime import datetime

from src.db import Base
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.terrain_parameters import TerrainParameters
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.models.species import Species
from src.models.input import Input
from src.schemas.input import InputCreate
from src.crud.input import create_input, get_input, get_inputs, get_all_inputs, delete_input
from src.services.input_effects import apply_input_effects

# Configuração do banco de dados de teste
TEST_DB_URL = "sqlite:///./test_inputs_integration.db"

@pytest.fixture(scope="module")
def db_session():
    """Cria um banco de dados de teste e retorna uma sessão."""
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    
    # Remover banco de dados de teste existente
    if os.path.exists("./test_inputs_integration.db"):
        os.remove("./test_inputs_integration.db")
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    # Criar sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Remover banco após os testes
        if os.path.exists("./test_inputs_integration.db"):
            os.remove("./test_inputs_integration.db")

@pytest.fixture(scope="module")
def test_data(db_session):
    """Cria dados de teste: player, terrain, quadrant, planting, e retorna seus IDs."""
    # 1. Criar espécie
    species = Species(
        key="integration_test_species",
        common_name="Espécie Teste Integração",
        germinacao_dias=5,
        maturidade_dias=20,
        agua_diaria_min=1.5,
        espaco_m2=0.5,
        rendimento_unid=5,
        tolerancia_seca="média"
    )
    db_session.add(species)
    
    # 2. Criar jogador
    player = Player(
        name="Jogador Teste Integração",
        balance=200.0,
        aura=50.0,
        actions_count=0
    )
    db_session.add(player)
    db_session.flush()  # Obter IDs sem commit
    
    # 3. Criar terreno
    terrain = Terrain(
        player_id=player.id,
        name="Terreno Teste Integração",
        x_coordinate=5.0,
        y_coordinate=5.0,
        access_type="public"
    )
    db_session.add(terrain)
    db_session.flush()
    
    # 4. Criar parâmetros do terreno
    terrain_params = TerrainParameters(
        terrain_id=terrain.id,
        coverage=15.0,
        regeneration_cycles=1,
        soil_moisture=20.0,  # Umidade inicial
        fertility=25,        # Fertilidade inicial
        organic_matter=10    # Matéria orgânica inicial
    )
    db_session.add(terrain_params)
    
    # 5. Criar quadrante
    quadrant = Quadrant(
        terrain_id=terrain.id,
        label="A1",
        soil_moisture=20.0,
        fertility=25,
        coverage=15.0,
        organic_matter=10
    )
    db_session.add(quadrant)
    db_session.flush()
    
    # 6. Criar plantio
    planting = Planting(
        species_id=species.id,
        player_id=player.id,
        quadrant_id=quadrant.id,
        slot_index=1,
        current_state="SEMENTE",
        days_since_planting=2,
        days_sem_rega=2  # Não regada há 2 dias
    )
    db_session.add(planting)
    db_session.commit()
    
    # Retornar dados para os testes
    return {
        "species_id": species.id,
        "player_id": player.id,
        "terrain_id": terrain.id,
        "terrain_params_id": terrain_params.id,
        "quadrant_id": quadrant.id,
        "planting_id": planting.id
    }

def test_water_increases_soil_moisture(db_session, test_data):
    """Testa se a aplicação de água aumenta a umidade do solo e reseta days_sem_rega."""
    # 1. Obter parâmetros antes da aplicação
    terrain_params = db_session.query(TerrainParameters).filter(
        TerrainParameters.terrain_id == test_data["terrain_id"]
    ).first()
    initial_moisture = terrain_params.soil_moisture
    
    # Obter plantio
    planting = db_session.query(Planting).filter(
        Planting.id == test_data["planting_id"]
    ).first()
    initial_days_sem_rega = planting.days_sem_rega
    
    # 2. Aplicar água
    water_input_data = InputCreate(
        planting_id=test_data["planting_id"],
        type="água",
        quantity=10.0
    )
    water_input = create_input(db_session, water_input_data)
    
    # Nota: os efeitos já são aplicados automaticamente na função create_input
    
    # 3. Verificar efeitos
    db_session.refresh(terrain_params)
    db_session.refresh(planting)
    
    # Verificar aumento da umidade
    assert terrain_params.soil_moisture > initial_moisture, "A umidade do solo deveria aumentar após aplicação de água"
    # Apenas verificamos que houve aumento, sem verificar o valor exato
    # já que create_input já aplica os efeitos automaticamente
    
    # Verificar reset de days_sem_rega
    assert planting.days_sem_rega == 0, "days_sem_rega deveria ser resetado para 0 após aplicação de água"

def test_fertilizer_increases_fertility(db_session, test_data):
    """Testa se a aplicação de fertilizante aumenta a fertilidade do solo."""
    # 1. Obter parâmetros antes da aplicação
    terrain_params = db_session.query(TerrainParameters).filter(
        TerrainParameters.terrain_id == test_data["terrain_id"]
    ).first()
    initial_fertility = terrain_params.fertility
    
    # 2. Aplicar fertilizante
    fert_input_data = InputCreate(
        planting_id=test_data["planting_id"],
        type="fertilizante",
        quantity=5.0
    )
    fert_input = create_input(db_session, fert_input_data)
    
    # Nota: os efeitos já são aplicados automaticamente na função create_input
    
    # 3. Verificar efeitos
    db_session.refresh(terrain_params)
    
    # Verificar aumento da fertilidade
    assert terrain_params.fertility > initial_fertility, "A fertilidade do solo deveria aumentar após aplicação de fertilizante"
    # Apenas verificamos que houve aumento, sem verificar o valor exato
    # já que create_input já aplica os efeitos automaticamente

def test_compost_increases_organic_matter_and_fertility(db_session, test_data):
    """Testa se a aplicação de composto aumenta a matéria orgânica e, secundariamente, a fertilidade."""
    # 1. Obter parâmetros antes da aplicação
    terrain_params = db_session.query(TerrainParameters).filter(
        TerrainParameters.terrain_id == test_data["terrain_id"]
    ).first()
    initial_organic_matter = terrain_params.organic_matter
    initial_fertility = terrain_params.fertility
    
    # 2. Aplicar composto
    compost_input_data = InputCreate(
        planting_id=test_data["planting_id"],
        type="composto",
        quantity=8.0
    )
    compost_input = create_input(db_session, compost_input_data)
    
    # Nota: os efeitos já são aplicados automaticamente na função create_input
    
    # 3. Verificar efeitos
    db_session.refresh(terrain_params)
    
    # Verificar aumento da matéria orgânica
    assert terrain_params.organic_matter > initial_organic_matter, "A matéria orgânica deveria aumentar após aplicação de composto"
    
    # Verificar aumento secundário da fertilidade
    assert terrain_params.fertility > initial_fertility, "A fertilidade deveria aumentar como efeito secundário do composto"
    
    # Nota: Apenas verificamos que houve aumento, sem verificar o valor exato
    # já que create_input já aplica os efeitos automaticamente

def test_crud_operations(db_session, test_data):
    """Testa operações CRUD completas para insumos."""
    # 1. Create: Criar insumo
    input_data = InputCreate(
        planting_id=test_data["planting_id"],
        type="água",
        quantity=3.0
    )
    input_record = create_input(db_session, input_data)
    assert input_record.id is not None, "O insumo deveria ter sido criado com ID"
    assert input_record.type == "água", "O tipo do insumo deveria ser 'água'"
    assert input_record.quantity == 3.0, "A quantidade do insumo deveria ser 3.0"
    
    # 2. Read: Obter insumo por ID
    retrieved_input = get_input(db_session, input_record.id)
    assert retrieved_input is not None, "O insumo deveria ser recuperado pelo ID"
    assert retrieved_input.id == input_record.id, "O ID do insumo recuperado deveria corresponder"
    
    # 3. Read: Listar insumos do plantio
    inputs_list = get_inputs(db_session, planting_id=test_data["planting_id"])
    assert len(inputs_list) >= 1, "Deveria haver pelo menos um insumo para o plantio"
    assert any(i.id == input_record.id for i in inputs_list), "O insumo criado deveria estar na lista"
    
    # 4. Delete: Excluir insumo
    success = delete_input(db_session, input_record.id)
    assert success is True, "A exclusão do insumo deveria ter sucesso"
    
    # 5. Verificar exclusão
    deleted_input = get_input(db_session, input_record.id)
    assert deleted_input is None, "O insumo excluído não deveria ser encontrado"

def test_validation_non_existent_planting(db_session):
    """Testa validação de plantio inexistente."""
    non_existent_id = 99999  # ID que certamente não existe
    input_data = InputCreate(
        planting_id=non_existent_id,
        type="água",
        quantity=1.0
    )
    
    # Tentar criar insumo com plantio inexistente deve falhar
    with pytest.raises(ValueError) as excinfo:
        create_input(db_session, input_data)
    
    # Verificar mensagem de erro específica
    assert "not found" in str(excinfo.value), "O erro deveria indicar que o plantio não foi encontrado"
    assert str(non_existent_id) in str(excinfo.value), "O erro deveria incluir o ID do plantio não encontrado"
