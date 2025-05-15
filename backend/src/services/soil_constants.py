"""
Constants related to soil parameters and deterioration used across multiple services.
"""

# Fatores de deterioração diária para cada parâmetro (valores em %)
DAILY_DETERIORATION_FACTORS = {
    "soil_moisture": 2.5,     # Perda diária de 2.5% da umidade
    "organic_matter": 0.8,    # Perda diária de 0.8% da matéria orgânica
    "biodiversity": 0.5,      # Perda diária de 0.5% da biodiversidade
}

# Limites mínimos de cada parâmetro após deterioração
MIN_VALUES = {
    "soil_moisture": 5.0,     # A umidade natural não cai abaixo de 5%
    "organic_matter": 3,      # A matéria orgânica não cai abaixo de 3
    "biodiversity": 2,        # A biodiversidade não cai abaixo de 2
}
