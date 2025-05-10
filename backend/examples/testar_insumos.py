#!/usr/bin/env python3
"""
Script para testar a aplicação de insumos e seus efeitos nos parâmetros do solo.
Utiliza a API HTTP para demonstrar o uso real da funcionalidade.
"""
import os
import sys
import json
import requests
import logging
from datetime import datetime
from pprint import pprint

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# URLs da API
BASE_URL = "http://localhost:8000"  # Ajuste conforme necessário
API_PLAYERS = f"{BASE_URL}/players"
API_TERRAINS = f"{BASE_URL}/terrains"
API_QUADRANTS = f"{BASE_URL}/quadrants"
API_SPECIES = f"{BASE_URL}/species"
API_PLANTINGS = f"{BASE_URL}/plantings"
API_INPUTS = f"{BASE_URL}/inputs"

def criar_ambiente_teste():
    """Cria os dados necessários para testar a aplicação de insumos."""
    logger.info("Criando ambiente de teste...")
    
    # 1. Criar jogador
    player_data = {
        "name": "Jogador Teste Insumos",
        "balance": 1000.0,
        "aura": 100.0
    }
    response = requests.post(API_PLAYERS, json=player_data)
    if response.status_code != 200:
        logger.error(f"Erro ao criar jogador: {response.text}")
        return None
    
    player = response.json()
    logger.info(f"Jogador criado com ID: {player['id']}")
    
    # 2. Criar terreno
    terrain_data = {
        "player_id": player["id"],
        "name": "Terreno Teste Insumos",
        "x_coordinate": 10.0,
        "y_coordinate": 10.0,
        "access_type": "public"
    }
    response = requests.post(API_TERRAINS, json=terrain_data)
    if response.status_code != 200:
        logger.error(f"Erro ao criar terreno: {response.text}")
        return None
    
    terrain = response.json()
    logger.info(f"Terreno criado com ID: {terrain['id']}")
    
    # 3. Criar quadrante
    quadrant_data = {
        "terrain_id": terrain["id"],
        "label": "A1",
        "soil_moisture": 20.0,
        "fertility": 30,
        "coverage": 10.0,
        "organic_matter": 15,
        "soil_ph": 6.5
    }
    response = requests.post(API_QUADRANTS, json=quadrant_data)
    if response.status_code != 200:
        logger.error(f"Erro ao criar quadrante: {response.text}")
        return None
    
    quadrant = response.json()
    logger.info(f"Quadrante criado com ID: {quadrant['id']}")
    
    # 4. Buscar espécie para plantio
    response = requests.get(f"{API_SPECIES}?skip=0&limit=1")
    if response.status_code != 200 or not response.json():
        logger.error("Nenhuma espécie encontrada. Criando espécie de teste...")
        species_data = {
            "key": "test_species_1",
            "common_name": "Espécie de Teste",
            "germinacao_dias": 7,
            "maturidade_dias": 30,
            "agua_diaria_min": 2.5,
            "espaco_m2": 1.0,
            "rendimento_unid": 10,
            "tolerancia_seca": "média"
        }
        response = requests.post(f"{API_SPECIES}", json=species_data)
        if response.status_code != 200:
            logger.error(f"Erro ao criar espécie: {response.text}")
            return None
        species = response.json()
    else:
        species = response.json()[0]
    
    logger.info(f"Espécie selecionada: {species['common_name']} (ID: {species['id']})")
    
    # 5. Criar plantio
    planting_data = {
        "species_id": species["id"],
        "player_id": player["id"],
        "quadrant_id": quadrant["id"],
        "slot_index": 1,
        "current_state": "SEMENTE",
        "days_since_planting": 5,
        "days_sem_rega": 3
    }
    response = requests.post(API_PLANTINGS, json=planting_data)
    if response.status_code != 200:
        logger.error(f"Erro ao criar plantio: {response.text}")
        return None
    
    planting = response.json()
    logger.info(f"Plantio criado com ID: {planting['id']}")
    
    return {
        "player": player,
        "terrain": terrain,
        "quadrant": quadrant,
        "species": species,
        "planting": planting
    }

def aplicar_insumos(planting_id):
    """Aplica diferentes insumos no plantio e mostra seus efeitos."""
    logger.info("\n" + "="*50)
    logger.info("TESTE DE APLICAÇÃO DE INSUMOS")
    logger.info("="*50)
    
    # 1. Aplicar água
    logger.info("\n1. Aplicando água...")
    agua_data = {
        "planting_id": planting_id,
        "type": "água",
        "quantity": 10.0
    }
    response = requests.post(API_INPUTS, json=agua_data)
    if response.status_code != 200:
        logger.error(f"Erro ao aplicar água: {response.text}")
        return False
    
    agua_result = response.json()
    logger.info("Resultado da aplicação de água:")
    logger.info(f"- ID do insumo: {agua_result['id']}")
    logger.info(f"- Tipo: {agua_result['type']}")
    logger.info(f"- Quantidade: {agua_result['quantity']}")
    logger.info(f"- Data de aplicação: {agua_result['applied_at']}")
    logger.info("Efeitos aplicados:")
    
    for effect in agua_result.get("effects", []):
        logger.info(f"- Parâmetro '{effect['parameter']}': {effect['before']:.1f} -> {effect['after']:.1f} (Δ {effect['change']:.1f})")
    
    if agua_result.get("plant_effects"):
        for param, effect in agua_result["plant_effects"].items():
            logger.info(f"- Efeito na planta '{param}': {effect['before']} -> {effect['after']} (Δ {effect['change']})")
    
    # 2. Aplicar fertilizante
    logger.info("\n2. Aplicando fertilizante...")
    fert_data = {
        "planting_id": planting_id,
        "type": "fertilizante",
        "quantity": 5.0
    }
    response = requests.post(API_INPUTS, json=fert_data)
    if response.status_code != 200:
        logger.error(f"Erro ao aplicar fertilizante: {response.text}")
        return False
    
    fert_result = response.json()
    logger.info("Resultado da aplicação de fertilizante:")
    logger.info(f"- ID do insumo: {fert_result['id']}")
    
    for effect in fert_result.get("effects", []):
        logger.info(f"- Parâmetro '{effect['parameter']}': {effect['before']:.1f} -> {effect['after']:.1f} (Δ {effect['change']:.1f})")
    
    # 3. Aplicar composto
    logger.info("\n3. Aplicando composto orgânico...")
    compost_data = {
        "planting_id": planting_id,
        "type": "composto",
        "quantity": 8.0
    }
    response = requests.post(API_INPUTS, json=compost_data)
    if response.status_code != 200:
        logger.error(f"Erro ao aplicar composto: {response.text}")
        return False
    
    compost_result = response.json()
    logger.info("Resultado da aplicação de composto:")
    logger.info(f"- ID do insumo: {compost_result['id']}")
    
    for effect in compost_result.get("effects", []):
        logger.info(f"- Parâmetro '{effect['parameter']}': {effect['before']:.1f} -> {effect['after']:.1f} (Δ {effect['change']:.1f})")
    
    # 4. Aplicar calcário (se disponível no sistema)
    logger.info("\n4. Aplicando calcário...")
    lime_data = {
        "planting_id": planting_id,
        "type": "calcário",
        "quantity": 3.0
    }
    response = requests.post(API_INPUTS, json=lime_data)
    if response.status_code != 200:
        logger.warning(f"Não foi possível aplicar calcário: {response.text}")
    else:
        lime_result = response.json()
        logger.info("Resultado da aplicação de calcário:")
        logger.info(f"- ID do insumo: {lime_result['id']}")
        
        for effect in lime_result.get("effects", []):
            logger.info(f"- Parâmetro '{effect['parameter']}': {effect['before']:.1f} -> {effect['after']:.1f} (Δ {effect['change']:.1f})")
    
    logger.info("\n" + "="*50)
    logger.info("TESTE DE INSUMOS CONCLUÍDO COM SUCESSO!")
    logger.info("="*50)
    return True

def main():
    """Função principal do script."""
    try:
        # Verificar se o servidor está rodando
        try:
            response = requests.get(BASE_URL)
            if response.status_code != 200:
                logger.error(f"Servidor não está respondendo corretamente. Verifique se ele está rodando na URL {BASE_URL}")
                return 1
        except requests.exceptions.ConnectionError:
            logger.error(f"Não foi possível conectar ao servidor na URL {BASE_URL}. Verifique se ele está rodando.")
            return 1
        
        # Criar ambiente de teste
        env = criar_ambiente_teste()
        if not env:
            logger.error("Falha ao criar ambiente de teste.")
            return 1
        
        # Aplicar insumos
        success = aplicar_insumos(env["planting"]["id"])
        return 0 if success else 1
        
    except Exception as e:
        logger.error(f"Erro durante a execução do script: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
