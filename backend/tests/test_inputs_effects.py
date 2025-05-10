"""
Testes para verificar se os insumos estão afetando corretamente os parâmetros do solo.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.main import app
from src.schemas.input import InputCreate
from src.models.input import Input
from src.models.terrain_parameters import TerrainParameters
from src.crud.terrain_parameters import get_terrain_parameters

client = TestClient(app)

@pytest.fixture(scope="module")
def test_data():
    """Fixture para armazenar dados entre testes"""
    return {}

def test_water_effect_on_soil_moisture(client, test_data):
    """
    Testa se a aplicação de água aumenta a umidade do solo (soil_moisture)
    e reseta days_sem_rega para zero.
    """
    # 1. Criar jogador para teste
    player_data = {"name": "Jogador Teste Insumos", "balance": 1000.0, "aura": 100.0}
    player_response = client.post("/players/", json=player_data)
    assert player_response.status_code == 200
    player = player_response.json()
    test_data["player_id"] = player["id"]
    
    # 2. Criar terreno para o jogador
    terrain_data = {
        "player_id": player["id"],
        "name": "Terreno Teste Insumos",
        "x_coordinate": 10.0,
        "y_coordinate": 10.0,
        "access_type": "public"
    }
    terrain_response = client.post("/terrains/", json=terrain_data)
    assert terrain_response.status_code == 200
    terrain = terrain_response.json()
    test_data["terrain_id"] = terrain["id"]
    
    # 3. Buscar parâmetros do terreno antes da aplicação do insumo
    terrain_params_before = client.get(f"/terrain-parameters/?terrain_id={terrain['id']}")
    assert terrain_params_before.status_code == 200
    params_before = terrain_params_before.json()
    
    # Guardar valores iniciais para comparação
    initial_soil_moisture = params_before.get("soil_moisture", 0)
    
    # 4. Obter um quadrante para o terreno
    quadrants_response = client.get(f"/quadrants/?terrain_id={terrain['id']}")
    assert quadrants_response.status_code == 200
    quadrants = quadrants_response.json()
    assert len(quadrants) > 0
    test_data["quadrant_id"] = quadrants[0]["id"]
    
    # 5. Criar um plantio no quadrante
    planting_data = {
        "player_id": player["id"],
        "species_id": 1,  # Assumindo que existe uma espécie com ID 1
        "quadrant_id": test_data["quadrant_id"],
        "slot_index": 1
    }
    planting_response = client.post("/plantings/", json=planting_data)
    assert planting_response.status_code == 200
    planting = planting_response.json()
    test_data["planting_id"] = planting["id"]
    
    # 6. Aplicar água como insumo
    water_quantity = 10.0
    input_data = {
        "planting_id": planting["id"],
        "type": "água",
        "quantity": water_quantity
    }
    input_response = client.post("/inputs/", json=input_data)
    assert input_response.status_code == 200
    
    # 7. Buscar parâmetros do terreno após a aplicação do insumo
    terrain_params_after = client.get(f"/terrain-parameters/?terrain_id={terrain['id']}")
    assert terrain_params_after.status_code == 200
    params_after = terrain_params_after.json()
    
    # 8. Verificar se a umidade do solo aumentou conforme esperado
    final_soil_moisture = params_after.get("soil_moisture", 0)
    expected_increase = water_quantity * 0.8  # Conforme definido em INPUT_EFFECTS
    
    # Devido a possíveis arredondamentos, verificamos se está próximo do esperado
    assert final_soil_moisture > initial_soil_moisture, "A umidade do solo deveria ter aumentado"
    assert abs(final_soil_moisture - (initial_soil_moisture + expected_increase)) < 0.1, \
        f"Aumento de umidade do solo deveria ser aproximadamente {expected_increase}"
    
    # Verificar também se o plantio teve days_sem_rega resetado para zero
    planting_after = client.get(f"/plantings/{planting['id']}")
    assert planting_after.status_code == 200
    planting_data_after = planting_after.json()
    assert planting_data_after.get("days_sem_rega", -1) == 0, "days_sem_rega deveria ter sido resetado para zero"

def test_fertilizer_effect_on_fertility(client, test_data):
    """
    Testa se a aplicação de fertilizante aumenta a fertilidade do solo (fertility).
    """
    # Usar o terreno e plantio criados no teste anterior
    terrain_id = test_data.get("terrain_id")
    planting_id = test_data.get("planting_id")
    
    # 1. Buscar parâmetros do terreno antes da aplicação do insumo
    terrain_params_before = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_before.status_code == 200
    params_before = terrain_params_before.json()
    
    # Guardar valores iniciais para comparação
    initial_fertility = params_before.get("fertility", 0)
    
    # 2. Aplicar fertilizante como insumo
    fertilizer_quantity = 5.0
    input_data = {
        "planting_id": planting_id,
        "type": "fertilizante",
        "quantity": fertilizer_quantity
    }
    input_response = client.post("/inputs/", json=input_data)
    assert input_response.status_code == 200
    
    # 3. Buscar parâmetros do terreno após a aplicação do insumo
    terrain_params_after = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_after.status_code == 200
    params_after = terrain_params_after.json()
    
    # 4. Verificar se a fertilidade aumentou conforme esperado
    final_fertility = params_after.get("fertility", 0)
    expected_increase = 1 + (fertilizer_quantity * 0.5)  # Conforme definido em INPUT_EFFECTS
    
    assert final_fertility > initial_fertility, "A fertilidade do solo deveria ter aumentado"
    assert abs(final_fertility - (initial_fertility + expected_increase)) < 0.1, \
        f"Aumento de fertilidade deveria ser aproximadamente {expected_increase}"

def test_compost_effect_on_organic_matter(client, test_data):
    """
    Testa se a aplicação de composto aumenta a matéria orgânica (organic_matter)
    e tem um efeito secundário na fertilidade.
    """
    # Usar o terreno e plantio criados nos testes anteriores
    terrain_id = test_data.get("terrain_id")
    planting_id = test_data.get("planting_id")
    
    # 1. Buscar parâmetros do terreno antes da aplicação do insumo
    terrain_params_before = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_before.status_code == 200
    params_before = terrain_params_before.json()
    
    # Guardar valores iniciais para comparação
    initial_organic_matter = params_before.get("organic_matter", 0)
    initial_fertility = params_before.get("fertility", 0)
    
    # 2. Aplicar composto como insumo
    compost_quantity = 8.0
    input_data = {
        "planting_id": planting_id,
        "type": "composto",
        "quantity": compost_quantity
    }
    input_response = client.post("/inputs/", json=input_data)
    assert input_response.status_code == 200
    
    # 3. Buscar parâmetros do terreno após a aplicação do insumo
    terrain_params_after = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_after.status_code == 200
    params_after = terrain_params_after.json()
    
    # 4. Verificar se a matéria orgânica aumentou conforme esperado
    final_organic_matter = params_after.get("organic_matter", 0)
    expected_organic_increase = 1 + (compost_quantity * 0.7)  # Conforme definido em INPUT_EFFECTS
    
    assert final_organic_matter > initial_organic_matter, "A matéria orgânica do solo deveria ter aumentado"
    assert abs(final_organic_matter - (initial_organic_matter + expected_organic_increase)) < 0.1, \
        f"Aumento de matéria orgânica deveria ser aproximadamente {expected_organic_increase}"
    
    # 5. Verificar se a fertilidade também aumentou (efeito secundário)
    final_fertility = params_after.get("fertility", 0)
    expected_fertility_increase = compost_quantity * 0.2  # Efeito secundário do composto
    
    assert final_fertility > initial_fertility, "A fertilidade do solo também deveria ter aumentado"
    assert abs(final_fertility - (initial_fertility + expected_fertility_increase)) < 0.1, \
        f"Aumento secundário de fertilidade deveria ser aproximadamente {expected_fertility_increase}"

def test_cumulative_water_effects(client, test_data):
    """
    Testa se aplicações múltiplas de água têm efeito cumulativo na umidade do solo.
    """
    # Usar o terreno e plantio criados nos testes anteriores
    terrain_id = test_data.get("terrain_id")
    planting_id = test_data.get("planting_id")
    
    # 1. Buscar parâmetros do terreno antes das aplicações
    terrain_params_before = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_before.status_code == 200
    params_before = terrain_params_before.json()
    initial_soil_moisture = params_before.get("soil_moisture", 0)
    
    # 2. Aplicar água duas vezes
    water_quantity = 5.0
    
    # Primeira aplicação
    input_data = {
        "planting_id": planting_id,
        "type": "água",
        "quantity": water_quantity
    }
    client.post("/inputs/", json=input_data)
    
    # Segunda aplicação
    client.post("/inputs/", json=input_data)
    
    # 3. Buscar parâmetros do terreno após as aplicações
    terrain_params_after = client.get(f"/terrain-parameters/?terrain_id={terrain_id}")
    assert terrain_params_after.status_code == 200
    params_after = terrain_params_after.json()
    
    # 4. Verificar se a umidade do solo aumentou cumulativamente
    final_soil_moisture = params_after.get("soil_moisture", 0)
    expected_increase = water_quantity * 0.8 * 2  # Duas aplicações
    
    assert final_soil_moisture > initial_soil_moisture, "A umidade do solo deveria ter aumentado"
    assert abs(final_soil_moisture - (initial_soil_moisture + expected_increase)) < 0.1, \
        f"Aumento cumulativo de umidade do solo deveria ser aproximadamente {expected_increase}"
