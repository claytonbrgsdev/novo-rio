"""
Serviço para cálculo de índice de saúde do solo e geração de alertas.
Este serviço fornece métodos para avaliar a qualidade do solo com base em
múltiplos parâmetros e identificar condições críticas.
"""
import logging
from typing import Dict, List, Tuple, Union

from ..models.terrain_parameters import TerrainParameters
from ..models.quadrant import Quadrant

logger = logging.getLogger(__name__)

# Pesos para o cálculo de índice de saúde
# Valores maiores indicam maior importância do parâmetro
HEALTH_WEIGHTS = {
    "soil_moisture": 1.0,      # Umidade do solo
    "fertility": 1.2,          # Fertilidade (ligeiramente mais importante)
    "soil_ph": 0.8,            # pH do solo
    "organic_matter": 1.1,     # Matéria orgânica
    "biodiversity": 0.9,       # Biodiversidade
    "compaction": 0.7          # Compactação (impacto negativo)
}

# Faixas ideais para cada parâmetro
# Formato: (min_ideal, max_ideal, min_warning, max_warning)
PARAMETER_RANGES = {
    "soil_moisture": (30.0, 70.0, 15.0, 85.0),  # Idealmente entre 30-70%, crítico abaixo de 15% ou acima de 85%
    "fertility": (40, 80, 20, 90),              # Ideal entre 40-80, crítico abaixo de 20 ou acima de 90
    "soil_ph": (5.5, 7.0, 5.0, 8.0),            # Ideal entre 5.5-7.0, crítico abaixo de 5.0 ou acima de 8.0
    "organic_matter": (30, 70, 10, 90),         # Ideal entre 30-70, crítico abaixo de 10 ou acima de 90
    "biodiversity": (40, 100, 20, 100),         # Ideal acima de 40, crítico abaixo de 20
    "compaction": (0, 40, 0, 70)                # Ideal abaixo de 40, crítico acima de 70
}

def calculate_health_index(params: Union[TerrainParameters, Quadrant, Dict]) -> float:
    """
    Calcula o índice de saúde do solo com base nos parâmetros fornecidos.
    
    O índice é calculado como uma média ponderada normalizada dos parâmetros,
    onde cada parâmetro é pontuado de 0 a 100 com base em quão próximo está 
    do seu intervalo ideal.
    
    Args:
        params: Um objeto TerrainParameters, Quadrant ou dicionário com os parâmetros do solo
        
    Returns:
        float: Valor do índice de saúde de 0 a 100
    """
    if isinstance(params, TerrainParameters) or isinstance(params, Quadrant):
        # Converter objeto para dicionário
        param_dict = {
            "soil_moisture": getattr(params, "soil_moisture", 0),
            "fertility": getattr(params, "fertility", 0),
            "soil_ph": getattr(params, "soil_ph", 7.0) if isinstance(params, TerrainParameters) else 7.0,
            "organic_matter": getattr(params, "organic_matter", 0),
            "biodiversity": getattr(params, "biodiversity", 0),
            "compaction": getattr(params, "compaction", 0)
        }
    else:
        param_dict = params
    
    total_score = 0.0
    total_weight = 0.0
    
    for param_name, weight in HEALTH_WEIGHTS.items():
        if param_name not in param_dict:
            continue
            
        value = param_dict[param_name]
        
        if param_name in PARAMETER_RANGES:
            min_ideal, max_ideal, min_warning, max_warning = PARAMETER_RANGES[param_name]
            
            # Cálculo do score para este parâmetro (0-100)
            score = 0.0
            
            if min_ideal <= value <= max_ideal:
                # Valor ideal = 100%
                score = 100.0
            elif value < min_warning or value > max_warning:
                # Valor crítico = pontuação baseada na distância até o limite de alerta
                if value < min_warning:
                    score = max(0, (value / min_warning) * 50)
                else:  # value > max_warning
                    # Para valores acima do máximo, pontuação diminui quanto maior o valor
                    excess = value - max_warning
                    max_excess = 100 - max_warning  # Assume-se que o máximo possível é 100
                    score = max(0, 50 * (1 - (excess / max_excess)))
            else:
                # Valor na faixa de alerta mas não crítico
                if value < min_ideal:
                    # Interpolar entre 50 (min_warning) e 100 (min_ideal)
                    score = 50 + (value - min_warning) / (min_ideal - min_warning) * 50
                else:  # value > max_ideal
                    # Interpolar entre 100 (max_ideal) e 50 (max_warning)
                    score = 100 - (value - max_ideal) / (max_warning - max_ideal) * 50
                    
            # Para compactação, valores mais baixos são melhores
            if param_name == "compaction":
                score = 100 - score
                
            total_score += score * weight
            total_weight += weight
    
    # Evitar divisão por zero
    if total_weight == 0:
        return 0.0
        
    # Normalizar para 0-100
    health_index = total_score / total_weight
    return round(health_index, 1)

def get_soil_health_category(health_index: float) -> str:
    """
    Determina a categoria de saúde do solo com base no índice.
    
    Args:
        health_index: Valor do índice de saúde (0-100)
        
    Returns:
        str: Categoria de saúde do solo
    """
    if health_index >= 90:
        return "Excelente"
    elif health_index >= 75:
        return "Muito Bom"
    elif health_index >= 60:
        return "Bom"
    elif health_index >= 45:
        return "Regular"
    elif health_index >= 30:
        return "Pobre"
    elif health_index >= 15:
        return "Muito Pobre"
    else:
        return "Crítico"

def analyze_soil_health(params: Union[TerrainParameters, Quadrant, Dict]) -> Dict:
    """
    Analisa a saúde do solo e retorna um relatório completo.
    
    Args:
        params: Um objeto TerrainParameters, Quadrant ou dicionário com os parâmetros do solo
        
    Returns:
        Dict: Relatório de saúde do solo incluindo índice, categoria e alertas
    """
    # Calcular índice de saúde
    health_index = calculate_health_index(params)
    health_category = get_soil_health_category(health_index)
    
    # Converter parâmetros para dicionário para análise
    if isinstance(params, TerrainParameters) or isinstance(params, Quadrant):
        param_dict = {
            "soil_moisture": getattr(params, "soil_moisture", 0),
            "fertility": getattr(params, "fertility", 0),
            "soil_ph": getattr(params, "soil_ph", 7.0) if isinstance(params, TerrainParameters) else 7.0,
            "organic_matter": getattr(params, "organic_matter", 0),
            "biodiversity": getattr(params, "biodiversity", 0),
            "compaction": getattr(params, "compaction", 0)
        }
    else:
        param_dict = params
    
    # Verificar alertas
    alerts = []
    recommendations = []
    
    for param_name, ranges in PARAMETER_RANGES.items():
        if param_name not in param_dict:
            continue
            
        value = param_dict[param_name]
        min_ideal, max_ideal, min_warning, max_warning = ranges
        
        param_display_names = {
            "soil_moisture": "Umidade do Solo",
            "fertility": "Fertilidade",
            "soil_ph": "pH do Solo",
            "organic_matter": "Matéria Orgânica",
            "biodiversity": "Biodiversidade",
            "compaction": "Compactação"
        }
        
        display_name = param_display_names.get(param_name, param_name)
        
        # Verificar condições críticas
        if value < min_warning:
            severity = "crítico" if value < min_warning * 0.5 else "alerta"
            alerts.append({
                "parameter": param_name,
                "display_name": display_name,
                "value": value,
                "ideal_range": [min_ideal, max_ideal],
                "severity": severity,
                "message": f"{display_name} está muito baixo ({value})"
            })
            
            # Recomendações baseadas no parâmetro
            if param_name == "soil_moisture":
                recommendations.append("Aplicar água para aumentar a umidade do solo")
            elif param_name == "fertility":
                recommendations.append("Aplicar fertilizante para aumentar a fertilidade")
            elif param_name == "soil_ph" and value < 5.5:
                recommendations.append("Aplicar calcário para aumentar o pH do solo")
            elif param_name == "organic_matter":
                recommendations.append("Aplicar composto para aumentar a matéria orgânica")
                
        elif value > max_warning:
            severity = "crítico" if value > max_warning * 1.5 else "alerta"
            alerts.append({
                "parameter": param_name,
                "display_name": display_name,
                "value": value,
                "ideal_range": [min_ideal, max_ideal],
                "severity": severity,
                "message": f"{display_name} está muito alto ({value})"
            })
            
            # Recomendações para valores altos
            if param_name == "soil_moisture":
                recommendations.append("Reduzir rega e melhorar drenagem do solo")
            elif param_name == "soil_ph" and value > 7.5:
                recommendations.append("O solo está muito alcalino, considere aplicar enxofre")
            elif param_name == "compaction":
                recommendations.append("O solo está muito compactado, considere aerar ou revolver")
    
    return {
        "health_index": health_index,
        "health_category": health_category,
        "alerts": alerts,
        "recommendations": recommendations
    }
