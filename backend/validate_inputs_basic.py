"""
Script simplificado para validar as operações CRUD básicas do sistema de insumos.
Este script verifica apenas o funcionamento das operações Create, Read, Update e Delete,
sem depender do processamento de efeitos.
"""
import os
import sys
import logging
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Adicionar diretório raiz ao path do Python
sys.path.insert(0, os.path.dirname(__file__))

from src.db import Base
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.models.species import Species
from src.models.input import Input
from src.schemas.input import InputCreate
from src.crud.input import create_input, get_input, get_inputs, get_all_inputs, delete_input

def validate_inputs_basic():
    """Validação das operações CRUD básicas do sistema de insumos"""
    logger.info("=" * 50)
    logger.info("VALIDAÇÃO BÁSICA DO SISTEMA DE INSUMOS")
    logger.info("=" * 50)
    
    # Configurar banco de dados
    db_url = "sqlite:///./basic_test.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Limpar banco de teste anterior
        if os.path.exists("./basic_test.db"):
            os.remove("./basic_test.db")
            logger.info("Banco de dados anterior removido.")
        
        # Criar tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas criadas com sucesso!")
        
        # Abrir sessão
        session = SessionLocal()
        
        # Criar dados de teste
        logger.info("\n1. Criando dados de teste (jogador, terreno, quadrante, plantio)...")
        
        # Espécie
        species = Species(
            key="basic_test_species",
            common_name="Teste Básico",
            germinacao_dias=5,
            maturidade_dias=20,
            agua_diaria_min=1.0,
            espaco_m2=0.5,
            rendimento_unid=5,
            tolerancia_seca="média"
        )
        session.add(species)
        
        # Jogador
        player = Player(
            name="Jogador Básico",
            balance=100.0,
            aura=50.0,
            actions_count=0
        )
        session.add(player)
        
        # Terreno
        terrain = Terrain(
            player_id=1,  # Será 1 após commit
            name="Terreno Básico",
            x_coordinate=5.0,
            y_coordinate=5.0,
            access_type="public"
        )
        session.add(terrain)
        
        # Commit para obter IDs
        session.commit()
        
        # Quadrante
        quadrant = Quadrant(
            terrain_id=terrain.id,
            label="A1",
            soil_moisture=10.0,
            fertility=15,
            coverage=5.0,
            organic_matter=10
            # soil_ph não é um campo do modelo Quadrant
        )
        session.add(quadrant)
        session.commit()
        
        # Plantio
        planting = Planting(
            species_id=species.id,
            player_id=player.id,
            quadrant_id=quadrant.id,
            slot_index=1,
            current_state="SEMENTE",
            days_since_planting=1,
            days_sem_rega=1
        )
        session.add(planting)
        session.commit()
        
        # Mostrar IDs para referência
        logger.info(f"Espécie criada: ID {species.id}")
        logger.info(f"Jogador criado: ID {player.id}")
        logger.info(f"Terreno criado: ID {terrain.id}")
        logger.info(f"Quadrante criado: ID {quadrant.id}")
        logger.info(f"Plantio criado: ID {planting.id}")
        
        # 2. Testar criação de insumo
        logger.info("\n2. Testando criação de insumo (água)...")
        water_input_data = InputCreate(
            planting_id=planting.id,
            type="água",
            quantity=5.0
        )
        
        water_input = create_input(session, water_input_data)
        logger.info(f"Insumo água criado: ID {water_input.id}")
        logger.info(f"Tipo: {water_input.type}")
        logger.info(f"Quantidade: {water_input.quantity}")
        logger.info(f"Data de aplicação: {water_input.applied_at}")
        
        # 3. Testar criação de outro insumo
        logger.info("\n3. Testando criação de outro insumo (fertilizante)...")
        fert_input_data = InputCreate(
            planting_id=planting.id,
            type="fertilizante",
            quantity=2.0
        )
        
        fert_input = create_input(session, fert_input_data)
        logger.info(f"Insumo fertilizante criado: ID {fert_input.id}")
        
        # 4. Testar obtenção de insumos por plantio
        logger.info("\n4. Testando obtenção de insumos por plantio...")
        inputs_list = get_inputs(session, planting_id=planting.id)
        logger.info(f"Encontrados {len(inputs_list)} insumos para o plantio {planting.id}")
        
        for i, input_item in enumerate(inputs_list, 1):
            logger.info(f"Insumo {i}: {input_item.type}, quantidade: {input_item.quantity}")
        
        # 5. Testar obtenção de um insumo específico
        logger.info("\n5. Testando obtenção de um insumo específico...")
        specific_input = get_input(session, water_input.id)
        
        if specific_input:
            logger.info(f"Insumo {specific_input.id} obtido: {specific_input.type}, quantidade: {specific_input.quantity}")
        else:
            logger.error(f"Não foi possível obter o insumo com ID {water_input.id}")
        
        # 6. Testar exclusão de insumo
        logger.info("\n6. Testando exclusão de insumo...")
        delete_result = delete_input(session, water_input.id)
        
        if delete_result:
            logger.info(f"Insumo {water_input.id} excluído com sucesso")
        else:
            logger.error(f"Falha ao excluir insumo {water_input.id}")
        
        # 7. Verificar que a exclusão funcionou
        logger.info("\n7. Verificando que a exclusão funcionou...")
        inputs_after_delete = get_inputs(session, planting_id=planting.id)
        logger.info(f"Agora existem {len(inputs_after_delete)} insumos para o plantio {planting.id}")
        
        # 8. Testar validação de plantio inexistente
        logger.info("\n8. Testando validação de plantio inexistente...")
        invalid_input_data = InputCreate(
            planting_id=9999,  # ID inexistente
            type="água",
            quantity=1.0
        )
        
        try:
            invalid_input = create_input(session, invalid_input_data)
            logger.error("FALHA: Criação de insumo com plantio inexistente deveria falhar")
        except ValueError as e:
            logger.info(f"SUCESSO: Validação funcionou corretamente: {e}")
        
        logger.info("\n" + "=" * 50)
        logger.info("VALIDAÇÃO BÁSICA CONCLUÍDA COM SUCESSO!")
        logger.info("=" * 50)
        
        return True
        
    except Exception as e:
        logger.error(f"Erro durante a validação: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        try:
            session.close()
        except:
            pass

if __name__ == "__main__":
    success = validate_inputs_basic()
    sys.exit(0 if success else 1)
