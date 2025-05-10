"""
Script para configurar o ambiente de teste completo.
Cria todas as tabelas necessárias para execução dos testes.
"""
import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configurar logging
logging.basicConfig(level=logging.INFO)
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

def setup_test_environment():
    """
    Cria todas as tabelas necessárias para os testes.
    Usa o banco de dados test.db específico para testes.
    """
    logger.info("Configurando ambiente de teste...")
    
    # Configurar conexão com banco de dados de teste
    test_db_url = "sqlite:///./test.db"
    engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Remover banco de dados de teste existente
        if os.path.exists("./test.db"):
            os.remove("./test.db")
            logger.info("Banco de dados de teste anterior removido.")
        
        # Criar todas as tabelas no banco de dados
        logger.info("Criando tabelas para teste...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas criadas com sucesso!")
        
        # Criar dados iniciais para testes
        with SessionLocal() as session:
            # Criar espécie de teste
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
            logger.info("Dados de espécies de teste criados.")
        
        logger.info("Ambiente de teste configurado com sucesso!")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao configurar ambiente de teste: {e}")
        return False

if __name__ == "__main__":
    success = setup_test_environment()
    sys.exit(0 if success else 1)
