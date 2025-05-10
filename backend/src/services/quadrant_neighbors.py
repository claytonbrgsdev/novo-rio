"""
Serviço para identificar quadrantes vizinhos e propagar efeitos entre eles.
"""
import logging
import re
from typing import List, Dict, Optional, Set, Tuple
from sqlalchemy.orm import Session

from ..models.quadrant import Quadrant
from ..models.terrain import Terrain

logger = logging.getLogger(__name__)

# Fator de propagação de efeitos para quadrantes vizinhos
PROPAGATION_FACTOR = 0.15  # 15% do efeito original é propagado para vizinhos

def parse_quadrant_coordinates(label: str) -> Optional[Tuple[str, int]]:
    """
    Extrai as coordenadas de um label de quadrante (exemplo: "A1" -> ("A", 1)).
    
    Args:
        label (str): Label do quadrante (ex: "A1", "B3", "C5")
        
    Returns:
        Optional[Tuple[str, int]]: Tupla com letra (coluna) e número (linha) ou None se inválido
    """
    # Padrão esperado: Uma ou mais letras seguidas por um ou mais números
    match = re.match(r'^([A-Za-z]+)(\d+)$', label)
    if not match:
        logger.warning(f"Label de quadrante inválido: {label}")
        return None
    
    column = match.group(1).upper()
    row = int(match.group(2))
    
    return (column, row)

def get_neighbor_coordinates(col: str, row: int) -> List[Tuple[str, int]]:
    """
    Determina as coordenadas dos quadrantes vizinhos de uma dada posição.
    
    Args:
        col (str): Coluna do quadrante (letra)
        row (int): Linha do quadrante (número)
        
    Returns:
        List[Tuple[str, int]]: Lista de coordenadas (col, row) dos vizinhos
    """
    neighbors = []
    
    # Converte letra para código ASCII e de volta para ter letras adjacentes
    col_code = ord(col.upper())
    
    # Vizinho à esquerda (se não for a primeira coluna 'A')
    if col_code > ord('A'):
        neighbors.append((chr(col_code - 1), row))
    
    # Vizinho à direita
    neighbors.append((chr(col_code + 1), row))
    
    # Vizinho acima (se não for a primeira linha 1)
    if row > 1:
        neighbors.append((col, row - 1))
    
    # Vizinho abaixo
    neighbors.append((col, row + 1))
    
    return neighbors

def get_quadrant_neighbors(db: Session, quadrant: Quadrant) -> List[Quadrant]:
    """
    Encontra todos os quadrantes vizinhos de um quadrante dado.
    
    Args:
        db (Session): Sessão do banco de dados
        quadrant (Quadrant): Quadrante de origem
        
    Returns:
        List[Quadrant]: Lista de quadrantes vizinhos
    """
    # Extrair coordenadas do quadrante
    coords = parse_quadrant_coordinates(quadrant.label)
    if not coords:
        return []
    
    col, row = coords
    neighbor_coords = get_neighbor_coordinates(col, row)
    
    # Criar labels de vizinhos para busca
    neighbor_labels = [f"{c}{r}" for c, r in neighbor_coords]
    
    # Buscar quadrantes vizinhos no mesmo terreno
    neighbor_quadrants = db.query(Quadrant).filter(
        Quadrant.terrain_id == quadrant.terrain_id,
        Quadrant.label.in_(neighbor_labels)
    ).all()
    
    return neighbor_quadrants

def propagate_effect_to_neighbors(
    db: Session, 
    quadrant: Quadrant, 
    effect_params: Dict[str, float],
    propagation_factor: float = PROPAGATION_FACTOR
) -> Dict[str, int]:
    """
    Propaga efeitos de um quadrante para seus vizinhos.
    
    Args:
        db (Session): Sessão do banco de dados
        quadrant (Quadrant): Quadrante de origem do efeito
        effect_params (Dict[str, float]): Dicionário com parâmetros e seus valores de efeito
        propagation_factor (float): Fator de propagação (0.0-1.0), padrão: 0.15 (15%)
        
    Returns:
        Dict[str, int]: Contador de quadrantes atualizados
    """
    neighbors = get_quadrant_neighbors(db, quadrant)
    
    if not neighbors:
        return {"quadrants_updated": 0}
    
    count = 0
    for neighbor in neighbors:
        updated = False
        
        for param, value in effect_params.items():
            if hasattr(neighbor, param):
                # Aplicar uma porcentagem do efeito ao vizinho
                propagated_value = value * propagation_factor
                current_value = getattr(neighbor, param)
                
                # Se o valor original for negativo (redução), mantém negativo na propagação
                if value >= 0:
                    new_value = current_value + propagated_value
                else:
                    new_value = max(0, current_value + propagated_value)
                
                setattr(neighbor, param, new_value)
                updated = True
                logger.debug(f"Efeito propagado para quadrante {neighbor.label}: {param} {'+' if value >= 0 else ''}{propagated_value:.2f}")
        
        if updated:
            count += 1
    
    if count > 0:
        db.commit()
        logger.info(f"Efeitos propagados para {count}/{len(neighbors)} quadrantes vizinhos de {quadrant.label}")
    
    return {"quadrants_updated": count}
