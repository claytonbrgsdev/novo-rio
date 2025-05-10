"""
Script de migração para criar a tabela de insumos (inputs).
"""
import os
import sys
import logging

# Adicionar diretório raiz ao path do Python para resolução de imports absolutos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from src.db import engine, Base
from src.models.input import Input

def create_inputs_table():
    """
    Cria a tabela de insumos (inputs) no banco de dados.
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Iniciando criação da tabela de insumos...")
        
        # Criar a tabela baseada no modelo SQLAlchemy
        Input.__table__.create(bind=engine, checkfirst=True)
        
        logger.info("Tabela de insumos criada com sucesso!")
        return True
    except Exception as e:
        logger.error(f"Erro ao criar tabela de insumos: {e}")
        return False

if __name__ == "__main__":
    success = create_inputs_table()
    sys.exit(0 if success else 1)
