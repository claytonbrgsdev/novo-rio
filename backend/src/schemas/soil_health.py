"""
Schema para representação do índice de saúde do solo e alertas relacionados.
"""
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union, Tuple

class SoilAlert(BaseModel):
    """Representa um alerta sobre um parâmetro do solo"""
    parameter: str
    display_name: str
    value: Union[float, int]
    ideal_range: List[Union[float, int]]
    severity: str  # 'alerta' ou 'crítico'
    message: str

class SoilHealthReport(BaseModel):
    """Relatório completo de saúde do solo"""
    health_index: float  # 0-100
    health_category: str  # Excelente, Muito Bom, Bom, etc.
    alerts: List[SoilAlert]
    recommendations: List[str]

    class Config:
        schema_extra = {
            "example": {
                "health_index": 78.5,
                "health_category": "Muito Bom",
                "alerts": [
                    {
                        "parameter": "soil_moisture",
                        "display_name": "Umidade do Solo",
                        "value": 15.0,
                        "ideal_range": [30.0, 70.0],
                        "severity": "alerta",
                        "message": "Umidade do Solo está muito baixo (15.0)"
                    }
                ],
                "recommendations": [
                    "Aplicar água para aumentar a umidade do solo"
                ]
            }
        }
