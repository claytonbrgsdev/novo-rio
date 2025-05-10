"""
Script integrado para validar a funcionalidade completa de insumos.
Este script cria todas as entidades necessárias (player, terrain, quadrant, planting)
e testa as operações de CRUD de insumos diretamente, sem depender do framework de testes.
"""
import os
import sys
import logging
from pprint import pprint
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Adicionar diretório raiz ao path do Python
sys.path.insert(0, os.path.dirname(__file__))

from src.db import Base
from src.models.player import Player
from src.models.terrain import Terrain
from src.models.terrain_parameters import TerrainParameters
from src.models.quadrant import Quadrant
from src.models.planting import Planting
from src.models.species import Species
from src.models.input import Input
from src.schemas.input import InputCreate
from src.crud.input import create_input, get_input, get_inputs, delete_input
from src.services.input_effects import apply_input_effects

def validate_inputs_functionality():
    """
    Validação completa da funcionalidade de insumos através de operações CRUD diretas.
    """
    logger.info("=" * 50)
    logger.info("VALIDAÇÃO DE FUNCIONALIDADE DE INSUMOS")
    logger.info("=" * 50)
    
    # Configurar conexão com banco de dados
    db_url = "sqlite:///./direct_test.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Remover banco de dados de teste existente
        if os.path.exists("./direct_test.db"):
            os.remove("./direct_test.db")
            logger.info("Banco de dados de teste anterior removido.")
        
        # Criar todas as tabelas no banco de dados
        logger.info("Criando tabelas para teste...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas criadas com sucesso!")
        
        # Abrir conexão com o banco
        session = SessionLocal()
        
        # 1. Criar espécie de teste
        logger.info("\n1. Criando espécie de teste...")
        test_species = Species(
            key="test_species_1",
            common_name="Espécie de Teste",
            germinacao_dias=7,
            maturidade_dias=30,
            agua_diaria_min=2.5,
            espaco_m2=1.0,
            rendimento_unid=10,
            tolerancia_seca="média"
        )
        session.add(test_species)
        session.commit()
        session.refresh(test_species)
        logger.info(f"Espécie criada com ID: {test_species.id}")
        
        # 2. Criar jogador de teste
        logger.info("\n2. Criando jogador de teste...")
        test_player = Player(
            name="Jogador Teste Insumos",
            balance=500.0,
            aura=100.0,
            actions_count=0
        )
        session.add(test_player)
        session.commit()
        session.refresh(test_player)
        logger.info(f"Jogador criado com ID: {test_player.id}")
        
        # 3. Criar terreno de teste
        logger.info("\n3. Criando terreno de teste...")
        test_terrain = Terrain(
            player_id=test_player.id,
            name="Terreno Teste Insumos",
            x_coordinate=10.0,
            y_coordinate=10.0,
            access_type="public"
        )
        session.add(test_terrain)
        session.commit()
        session.refresh(test_terrain)
        logger.info(f"Terreno criado com ID: {test_terrain.id}")
        
        # Criar parâmetros do terreno
        logger.info("\n3.1. Criando parâmetros do terreno...")
        terrain_params = TerrainParameters(
            terrain_id=test_terrain.id,
            coverage=15.0,
            regeneration_cycles=1,
            soil_moisture=25.0,
            fertility=30,
            organic_matter=20,
            soil_ph=6.5
        )
        session.add(terrain_params)
        session.commit()
        session.refresh(terrain_params)
        logger.info(f"Parâmetros do terreno criados com ID: {terrain_params.id}")
        logger.info(f"Valores iniciais: umidade={terrain_params.soil_moisture}, fertilidade={terrain_params.fertility}")
        
        # 4. Criar quadrantes para o terreno
        logger.info("\n4. Criando quadrantes para o terreno...")
        quadrants_created = 0
        ROWS = ["A", "B", "C"]
        COLS = ["1", "2", "3", "4", "5"]
        
        for r in ROWS:
            for c in COLS:
                label = f"{r}{c}"
                quadrant = Quadrant(
                    terrain_id=test_terrain.id,
                    label=label,
                    soil_moisture=0.0,
                    fertility=0,
                    coverage=0.0,
                    organic_matter=0,
                    compaction=0,
                    biodiversity=0
                )
                session.add(quadrant)
                quadrants_created += 1
        
        session.commit()
        logger.info(f"Criados {quadrants_created} quadrantes para o terreno")
        
        # 5. Obter o primeiro quadrante para teste
        logger.info("\n5. Obtendo primeiro quadrante para teste...")
        test_quadrant = session.query(Quadrant).filter(Quadrant.terrain_id == test_terrain.id).first()
        logger.info(f"Usando quadrante ID: {test_quadrant.id}, label: {test_quadrant.label}")
        
        # 6. Criar plantio no quadrante
        logger.info("\n6. Criando plantio no quadrante...")
        test_planting = Planting(
            species_id=test_species.id,
            player_id=test_player.id,
            quadrant_id=test_quadrant.id,
            slot_index=1,
            current_state="SEMENTE",
            days_since_planting=0,
            days_sem_rega=0
        )
        session.add(test_planting)
        session.commit()
        session.refresh(test_planting)
        logger.info(f"Plantio criado com ID: {test_planting.id}")
        
        # 7. Criar insumo (água) para o plantio
        logger.info("\n7. Criando insumo (água) para o plantio...")
        input_create_data = InputCreate(
            planting_id=test_planting.id,
            type="água",
            quantity=5.0
        )
        input_water = create_input(session, input_create_data)
        logger.info(f"Insumo água criado com ID: {input_water.id}")
        logger.info(f"- Tipo: {input_water.type}")
        logger.info(f"- Quantidade: {input_water.quantity}")
        logger.info(f"- Data aplicação: {input_water.applied_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 7.1 Verificar efeitos do insumo
        logger.info("\n7.1. Verificando efeitos do insumo água...")
        # Obter parâmetros atuais
        session.refresh(terrain_params)
        session.refresh(test_planting)
        logger.info(f"Umidade após água: {terrain_params.soil_moisture}")
        logger.info(f"Dias sem rega após água: {test_planting.days_sem_rega}")
        
        # Aplicar explicitamente os efeitos para testes
        effects = apply_input_effects(session, input_water)
        logger.info(f"Efeitos calculados: {effects}")
        
        # Obter parâmetros atualizados
        session.refresh(terrain_params)
        logger.info(f"Umidade final após aplicação de efeitos: {terrain_params.soil_moisture}")
        
        # 8. Criar segundo insumo (fertilizante) para o plantio
        logger.info("\n8. Criando segundo insumo (fertilizante) para o plantio...")
        input_create_data2 = InputCreate(
            planting_id=test_planting.id,
            type="fertilizante",
            quantity=2.0
        )
        input_fertilizer = create_input(session, input_create_data2)
        logger.info(f"Insumo fertilizante criado com ID: {input_fertilizer.id}")
        
        # 8.1 Verificar efeitos do insumo fertilizante
        logger.info("\n8.1. Verificando efeitos do insumo fertilizante...")
        # Obter parâmetros atuais
        session.refresh(terrain_params)
        logger.info(f"Fertilidade após fertilizante: {terrain_params.fertility}")
        
        # Aplicar explicitamente os efeitos para testes
        effects = apply_input_effects(session, input_fertilizer)
        logger.info(f"Efeitos calculados: {effects}")
        
        # Obter parâmetros atualizados
        session.refresh(terrain_params)
        logger.info(f"Fertilidade final após aplicação de efeitos: {terrain_params.fertility}")
        
        # 9. Buscar insumos do plantio
        logger.info("\n9. Buscando insumos do plantio...")
        planting_inputs = get_inputs(session, test_planting.id)
        logger.info(f"Encontrados {len(planting_inputs)} insumos para o plantio:")
        for idx, input_item in enumerate(planting_inputs, 1):
            logger.info(f"Insumo {idx}:")
            logger.info(f"- ID: {input_item.id}")
            logger.info(f"- Tipo: {input_item.type}")
            logger.info(f"- Quantidade: {input_item.quantity}")
            logger.info(f"- Data aplicação: {input_item.applied_at}")
        
        # 10. Testar busca de insumo por ID
        logger.info("\n10. Buscando insumo específico por ID...")
        specific_input = get_input(session, water_input.id)
        if specific_input:
            logger.info(f"Insumo encontrado: {specific_input.type} com quantidade {specific_input.quantity}")
        else:
            logger.error("Insumo não encontrado!")
            return False
        
        # 11. Testar exclusão de insumo
        logger.info("\n11. Testando exclusão de insumo...")
        delete_success = delete_input(session, fertilizer_input.id)
        if delete_success:
            logger.info("Insumo excluído com sucesso!")
        else:
            logger.error("Falha ao excluir insumo!")
            return False
        
        # 12. Verificar que insumo foi realmente excluído
        logger.info("\n12. Verificando que insumo foi realmente excluído...")
        planting_inputs_after_delete = get_inputs(session, test_planting.id)
        logger.info(f"Agora há {len(planting_inputs_after_delete)} insumos para o plantio")
        if len(planting_inputs_after_delete) != 1:
            logger.error(f"Esperava 1 insumo após exclusão, mas encontrou {len(planting_inputs_after_delete)}")
            return False
        
        # 13. Testar criação de insumo com planting_id inválido
        logger.info("\n13. Testando validação de planting_id inexistente...")
        try:
            invalid_input_data = InputCreate(
                planting_id=99999,  # ID inexistente
                type="composto",
                quantity=3.0
            )
            invalid_input = create_input(session, invalid_input_data)
            logger.error("FALHA: Criou insumo com planting_id inválido!")
            return False
        except ValueError as e:
            logger.info(f"SUCESSO: Validação funcionou corretamente: {e}")
        
        logger.info("\n" + "=" * 50)
        logger.info("TODOS OS TESTES PASSARAM COM SUCESSO!")
        logger.info("A funcionalidade de insumos está funcionando corretamente.")
        logger.info("=" * 50)
        return True
        
    except Exception as e:
        logger.error(f"Erro durante a validação: {e}")
        return False
    
    finally:
        try:
            session.close()
        except:
            pass

if __name__ == "__main__":
    success = validate_inputs_functionality()
    sys.exit(0 if success else 1)
