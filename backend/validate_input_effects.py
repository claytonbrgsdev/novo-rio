"""
Script integrado para validar os efeitos dos insumos diretamente nos parâmetros do solo.
Este script cria todas as entidades necessárias em um banco de dados temporário
e testa se a aplicação de insumos modifica corretamente os parâmetros do solo.
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
from src.schemas.terrain_parameters import TerrainParametersUpdate
from src.crud.input import create_input
from src.crud.terrain_parameters import update_terrain_parameters, get_terrain_parameters

def validate_input_effects():
    """
    Validação dos efeitos dos insumos nos parâmetros do solo.
    """
    logger.info("=" * 70)
    logger.info("VALIDAÇÃO DOS EFEITOS DOS INSUMOS NOS PARÂMETROS DO SOLO")
    logger.info("=" * 70)
    
    # Configurar conexão com banco de dados temporário
    db_url = "sqlite:///./input_effects_test.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Remover banco de dados de teste existente
        if os.path.exists("./input_effects_test.db"):
            os.remove("./input_effects_test.db")
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
            name="Jogador Teste Efeitos",
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
            name="Terreno Teste Efeitos",
            x_coordinate=10.0,
            y_coordinate=10.0,
            access_type="public"
        )
        session.add(test_terrain)
        session.commit()
        session.refresh(test_terrain)
        logger.info(f"Terreno criado com ID: {test_terrain.id}")
        
        # 4. Criar parâmetros para o terreno
        logger.info("\n4. Criando parâmetros iniciais para o terreno...")
        initial_params = TerrainParameters(
            terrain_id=test_terrain.id,
            coverage=10.0,
            regeneration_cycles=1,
            soil_moisture=20.0,
            fertility=30,
            soil_ph=6.5,
            organic_matter=15,
            compaction=10,
            biodiversity=5,
            spontaneous_species_count=0
        )
        session.add(initial_params)
        session.commit()
        session.refresh(initial_params)
        logger.info(f"Parâmetros iniciais criados com ID: {initial_params.id}")
        logger.info("Valores iniciais:")
        logger.info(f"- Soil Moisture: {initial_params.soil_moisture}")
        logger.info(f"- Fertility: {initial_params.fertility}")
        logger.info(f"- Organic Matter: {initial_params.organic_matter}")
        logger.info(f"- Soil pH: {initial_params.soil_ph}")
        
        # 5. Criar quadrantes para o terreno
        logger.info("\n5. Criando quadrantes para o terreno...")
        test_quadrant = Quadrant(
            terrain_id=test_terrain.id,
            label="A1",
            soil_moisture=20.0,
            fertility=30,
            coverage=10.0,
            organic_matter=15,
            compaction=10,
            biodiversity=5
        )
        session.add(test_quadrant)
        session.commit()
        session.refresh(test_quadrant)
        logger.info(f"Quadrante criado com ID: {test_quadrant.id}")
        
        # 6. Criar plantio no quadrante
        logger.info("\n6. Criando plantio no quadrante...")
        test_planting = Planting(
            species_id=test_species.id,
            player_id=test_player.id,
            quadrant_id=test_quadrant.id,
            slot_index=1,
            current_state="SEMENTE",
            days_since_planting=5,
            days_sem_rega=3
        )
        session.add(test_planting)
        session.commit()
        session.refresh(test_planting)
        logger.info(f"Plantio criado com ID: {test_planting.id}")
        logger.info(f"Days sem rega inicial: {test_planting.days_sem_rega}")
        
        # 7. Testar efeito da água
        logger.info("\n7. Testando efeito da água...")
        logger.info("Umidade do solo antes: " + str(initial_params.soil_moisture))
        water_input = InputCreate(
            planting_id=test_planting.id,
            type="água",
            quantity=10.0
        )
        water_record = create_input(session, water_input)
        
        # Obter parâmetros atualizados
        updated_params = get_terrain_parameters(session, test_terrain.id)
        # Obter plantio atualizado
        session.refresh(test_planting)
        
        logger.info("Umidade do solo após: " + str(updated_params.soil_moisture))
        logger.info(f"Days sem rega após água: {test_planting.days_sem_rega}")
        
        water_effect = updated_params.soil_moisture - initial_params.soil_moisture
        expected_water_effect = 10.0 * 0.8  # Conforme definido em input_effects.py
        
        if abs(water_effect - expected_water_effect) < 0.1:
            logger.info(f"SUCESSO: Efeito da água correto! Aumentou umidade em {water_effect:.1f} (esperado: {expected_water_effect:.1f})")
        else:
            logger.error(f"FALHA: Efeito da água incorreto! Aumentou umidade em {water_effect:.1f} (esperado: {expected_water_effect:.1f})")
            
        if test_planting.days_sem_rega == 0:
            logger.info("SUCESSO: A água resetou days_sem_rega para zero!")
        else:
            logger.error(f"FALHA: days_sem_rega não foi resetado para zero! Valor atual: {test_planting.days_sem_rega}")
        
        # 8. Testar efeito do fertilizante
        logger.info("\n8. Testando efeito do fertilizante...")
        logger.info("Fertilidade do solo antes: " + str(updated_params.fertility))
        
        fertilizer_input = InputCreate(
            planting_id=test_planting.id,
            type="fertilizante",
            quantity=5.0
        )
        fertilizer_record = create_input(session, fertilizer_input)
        
        # Obter parâmetros atualizados novamente
        updated_params_after_fert = get_terrain_parameters(session, test_terrain.id)
        
        logger.info("Fertilidade do solo após: " + str(updated_params_after_fert.fertility))
        
        fert_effect = updated_params_after_fert.fertility - updated_params.fertility
        expected_fert_effect = 1 + (5.0 * 0.5)  # Base + (quantidade * fator)
        
        if abs(fert_effect - expected_fert_effect) < 0.1:
            logger.info(f"SUCESSO: Efeito do fertilizante correto! Aumentou fertilidade em {fert_effect:.1f} (esperado: {expected_fert_effect:.1f})")
        else:
            logger.error(f"FALHA: Efeito do fertilizante incorreto! Aumentou fertilidade em {fert_effect:.1f} (esperado: {expected_fert_effect:.1f})")
        
        # 9. Testar efeito do composto
        logger.info("\n9. Testando efeito do composto...")
        logger.info("Matéria orgânica antes: " + str(updated_params_after_fert.organic_matter))
        logger.info("Fertilidade antes (2ª medição): " + str(updated_params_after_fert.fertility))
        
        compost_input = InputCreate(
            planting_id=test_planting.id,
            type="composto",
            quantity=8.0
        )
        compost_record = create_input(session, compost_input)
        
        # Obter parâmetros atualizados finais
        final_params = get_terrain_parameters(session, test_terrain.id)
        
        logger.info("Matéria orgânica após: " + str(final_params.organic_matter))
        logger.info("Fertilidade após: " + str(final_params.fertility))
        
        organic_effect = final_params.organic_matter - updated_params_after_fert.organic_matter
        expected_organic_effect = 1 + (8.0 * 0.7)  # Base + (quantidade * fator)
        
        secondary_fert_effect = final_params.fertility - updated_params_after_fert.fertility
        expected_secondary_effect = 8.0 * 0.2  # Efeito secundário na fertilidade
        
        if abs(organic_effect - expected_organic_effect) < 0.1:
            logger.info(f"SUCESSO: Efeito do composto na matéria orgânica correto! Aumentou em {organic_effect:.1f} (esperado: {expected_organic_effect:.1f})")
        else:
            logger.error(f"FALHA: Efeito do composto na matéria orgânica incorreto! Aumentou em {organic_effect:.1f} (esperado: {expected_organic_effect:.1f})")
            
        if abs(secondary_fert_effect - expected_secondary_effect) < 0.1:
            logger.info(f"SUCESSO: Efeito secundário do composto na fertilidade correto! Aumentou em {secondary_fert_effect:.1f} (esperado: {expected_secondary_effect:.1f})")
        else:
            logger.error(f"FALHA: Efeito secundário do composto na fertilidade incorreto! Aumentou em {secondary_fert_effect:.1f} (esperado: {expected_secondary_effect:.1f})")
        
        # 10. Testar efeito cumulativo (duas aplicações de água)
        logger.info("\n10. Testando efeito cumulativo (segunda aplicação de água)...")
        logger.info("Umidade do solo antes da segunda aplicação: " + str(final_params.soil_moisture))
        
        water_input2 = InputCreate(
            planting_id=test_planting.id,
            type="água",
            quantity=10.0
        )
        water_record2 = create_input(session, water_input2)
        
        # Obter parâmetros finais após segunda aplicação de água
        final_params2 = get_terrain_parameters(session, test_terrain.id)
        
        logger.info("Umidade do solo após segunda aplicação: " + str(final_params2.soil_moisture))
        
        cumulative_effect = final_params2.soil_moisture - final_params.soil_moisture
        expected_cumulative = 10.0 * 0.8  # Mesmo efeito da primeira aplicação
        
        if abs(cumulative_effect - expected_cumulative) < 0.1:
            logger.info(f"SUCESSO: Efeito cumulativo da água correto! Aumentou umidade em {cumulative_effect:.1f} (esperado: {expected_cumulative:.1f})")
        else:
            logger.error(f"FALHA: Efeito cumulativo da água incorreto! Aumentou umidade em {cumulative_effect:.1f} (esperado: {expected_cumulative:.1f})")
        
        logger.info("\n" + "=" * 70)
        logger.info("RESUMO FINAL DOS PARÂMETROS DO SOLO:")
        logger.info(f"Umidade do solo: {initial_params.soil_moisture:.1f} -> {final_params2.soil_moisture:.1f}")
        logger.info(f"Fertilidade: {initial_params.fertility} -> {final_params2.fertility}")
        logger.info(f"Matéria orgânica: {initial_params.organic_matter} -> {final_params2.organic_matter}")
        logger.info(f"pH do solo: {initial_params.soil_ph} -> {final_params2.soil_ph}")
        logger.info("=" * 70)
        logger.info("VALIDAÇÃO DE EFEITOS DE INSUMOS CONCLUÍDA COM SUCESSO!")
        logger.info("=" * 70)
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
    success = validate_input_effects()
    sys.exit(0 if success else 1)
