"""
Definições dos efeitos dos insumos nos parâmetros do solo.
Mapeia cada tipo de insumo para os parâmetros que ele afeta e a fórmula de cálculo.
"""

# Efeitos dos insumos por tipo
# Cada entrada define os parâmetros afetados e como eles são calculados
# quantity_factor: define como a quantidade afeta o valor final
# base_effect: efeito base independente da quantidade
INPUT_EFFECTS = {
    "água": {
        "soil_moisture": {"base_effect": 0, "quantity_factor": 0.8},
        "days_sem_rega": {"base_effect": 0, "quantity_factor": 0}  # Reset para 0 independente da quantidade
    },
    "fertilizante": {
        "fertility": {"base_effect": 1, "quantity_factor": 0.5}
    },
    "composto": {
        "organic_matter": {"base_effect": 1, "quantity_factor": 0.7},
        "fertility": {"base_effect": 0, "quantity_factor": 0.2}  # Efeito secundário na fertilidade
    },
    "calcário": {
        "soil_ph": {"base_effect": 0.1, "quantity_factor": 0.05}  # Aumenta o pH (torna menos ácido)
    },
    "cobertura vegetal": {
        "soil_moisture": {"base_effect": 0, "quantity_factor": 0.3},  # Ajuda a reter umidade
        "organic_matter": {"base_effect": 0, "quantity_factor": 0.2}
    }
}

# Limites para cada parâmetro (min, max)
PARAMETER_LIMITS = {
    "soil_moisture": (0, 100),
    "fertility": (0, 100),
    "organic_matter": (0, 100),
    "soil_ph": (4.0, 9.0),
    "compaction": (0, 100),
    "biodiversity": (0, 100)
}

# Função para calcular o efeito
def calculate_effect(parameter, effect_config, quantity):
    """
    Calcula o efeito em um parâmetro com base na configuração e quantidade.
    
    Args:
        parameter (str): Nome do parâmetro
        effect_config (dict): Configuração do efeito (base_effect e quantity_factor)
        quantity (float): Quantidade do insumo aplicado
        
    Returns:
        float: Valor do efeito calculado
    """
    base = effect_config.get("base_effect", 0)
    factor = effect_config.get("quantity_factor", 0)
    
    effect = base + (factor * quantity)
    
    # Se o parâmetro tem limites definidos, aplicá-los
    if parameter in PARAMETER_LIMITS:
        min_val, max_val = PARAMETER_LIMITS[parameter]
        # O efeito não deve fazer o valor final ultrapassar os limites
        # Isso é aplicado posteriormente quando conhecemos o valor atual
    
    return effect
