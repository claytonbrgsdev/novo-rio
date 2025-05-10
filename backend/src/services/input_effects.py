"""
Serviço para aplicar os efeitos dos insumos nos parâmetros do solo e das plantas.
"""
import logging
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..models.input import Input
from ..models.planting import Planting
from ..models.quadrant import Quadrant
from ..models.terrain import Terrain
from ..models.terrain_parameters import TerrainParameters
from ..data.input_effects import INPUT_EFFECTS, PARAMETER_LIMITS
from ..crud.terrain_parameters import update_terrain_parameters
from ..schemas.terrain_parameters import TerrainParametersUpdate
from .quadrant_neighbors import propagate_effect_to_neighbors

logger = logging.getLogger(__name__)

def apply_input_effects(db: Session, input_record: Input) -> dict:
    """
    Aplica os efeitos de um insumo nos parâmetros do solo e das plantas.
    
    Args:
        db (Session): Sessão do banco de dados
        input_record (Input): Registro do insumo aplicado
        
    Returns:
        dict: Dicionário com os parâmetros atualizados e efeitos detalhados
    """
    # 1. Buscar o plantio associado ao insumo
    planting = db.query(Planting).filter(Planting.id == input_record.planting_id).first()
    if not planting:
        logger.error(f"Plantio com ID {input_record.planting_id} não encontrado")
        return {}
    
    # 2. Buscar o quadrante e o terreno associados ao plantio
    quadrant = db.query(Quadrant).filter(Quadrant.id == planting.quadrant_id).first()
    if not quadrant:
        logger.error(f"Quadrante com ID {planting.quadrant_id} não encontrado")
        return {}
    
    terrain = db.query(Terrain).filter(Terrain.id == quadrant.terrain_id).first()
    if not terrain:
        logger.error(f"Terreno com ID {quadrant.terrain_id} não encontrado")
        return {}
    
    # 3. Buscar os parâmetros do terreno
    terrain_params = db.query(TerrainParameters).filter(
        TerrainParameters.terrain_id == terrain.id
    ).first()
    
    if not terrain_params:
        logger.error(f"Parâmetros do terreno com ID {terrain.id} não encontrados")
        return {}
    
    # 4. Carregar efeitos para o tipo de insumo
    input_type = input_record.type
    quantity = input_record.quantity
    
    effects = INPUT_EFFECTS.get(input_type, {})
    if not effects:
        logger.warning(f"Nenhum efeito definido para o tipo de insumo: {input_type}")
        return {}
    
    # 5. Calcular os novos valores para os parâmetros afetados
    param_updates = {}
    effects_details = []  # Lista para armazenar detalhes dos efeitos
    plant_effects = {}    # Dicionário para armazenar efeitos nas plantas
    
    for param_name, effect_config in effects.items():
        # Caso especial para days_sem_rega
        if param_name == "days_sem_rega" and input_type == "água":
            # Resetar para 0 independente da quantidade
            if hasattr(planting, "days_sem_rega"):
                old_value = planting.days_sem_rega
                planting.days_sem_rega = 0
                # Registrar o efeito na planta
                plant_effects["days_sem_rega"] = {
                    "before": old_value,
                    "after": 0,
                    "change": -old_value
                }
            continue
        
        # Para parâmetros normais, calcular o efeito baseado na quantidade
        current_value = getattr(terrain_params, param_name, 0)
        base_effect = effect_config.get("base_effect", 0)
        quantity_factor = effect_config.get("quantity_factor", 0)
        
        effect_value = base_effect + (quantity_factor * quantity)
        new_value = current_value + effect_value
        
        # Aplicar limites se definidos
        if param_name in PARAMETER_LIMITS:
            min_val, max_val = PARAMETER_LIMITS[param_name]
            new_value = max(min_val, min(new_value, max_val))
        
        param_updates[param_name] = new_value
        logger.info(f"Parâmetro {param_name} atualizado: {current_value} -> {new_value} (efeito: {effect_value})")
        
        # Registrar detalhes do efeito para retorno
        effects_details.append({
            "parameter": param_name,
            "before": current_value,
            "after": new_value,
            "change": effect_value
        })
    
    # 6. Atualizar os parâmetros do terreno no banco de dados
    if param_updates:
        update_data = TerrainParametersUpdate(**param_updates)
        updated_params = update_terrain_parameters(db, terrain.id, update_data)
        
        # Commit para salvar as alterações em planting.days_sem_rega se houver
        db.commit()
        
        if updated_params:
            logger.info(f"Parâmetros do terreno atualizados com sucesso: {param_updates}")
            # Retornar resultados mais detalhados
            # Atualizar quadrante
            for param, value in param_updates.items():
                if hasattr(quadrant, param):
                    setattr(quadrant, param, value)
            db.add(quadrant)
            
            # Propagar efeitos para quadrantes vizinhos
            # effect_details contém os dados sobre mudanças
            effect_delta = {}
            for detail in effects_details:
                param = detail["parameter"]
                # Guardar apenas o delta (mudança) e não o valor absoluto
                if "before" in detail and "after" in detail:
                    delta = detail["after"] - detail["before"]
                    effect_delta[param] = delta
            
            # Propagar os efeitos delta para os vizinhos
            if effect_delta:
                propagate_effect_to_neighbors(db, quadrant, effect_delta)
            
            return {
                "updates": param_updates,
                "effects": effects_details,
                "terrain_id": terrain.id,
                "quadrant_id": quadrant.id,
                "plant_effects": plant_effects if plant_effects else None
            }
        else:
            logger.error("Falha ao atualizar parâmetros do terreno")
            return {}
    
    # Se não houver atualizações, retornar dicionário vazio estruturado
    return {
        "updates": param_updates,
        "effects": effects_details,
        "terrain_id": terrain.id if terrain else None,
        "quadrant_id": quadrant.id if quadrant else None,
        "plant_effects": plant_effects if plant_effects else None
    }

async def apply_input_effects_async(db: AsyncSession, input_record: Input) -> dict:
    """
    Versão assíncrona para aplicar os efeitos de um insumo nos parâmetros do solo e das plantas.
    
    Args:
        db (AsyncSession): Sessão assíncrona do banco de dados
        input_record (Input): Registro do insumo aplicado
        
    Returns:
        dict: Dicionário com os parâmetros atualizados e efeitos detalhados
    """
    # 1. Buscar o plantio associado ao insumo
    result = await db.execute(select(Planting).where(Planting.id == input_record.planting_id))
    planting = result.scalars().first()
    if not planting:
        logger.error(f"Plantio com ID {input_record.planting_id} não encontrado")
        return {}
    
    # 2. Buscar o quadrante e o terreno associados ao plantio
    result = await db.execute(select(Quadrant).where(Quadrant.id == planting.quadrant_id))
    quadrant = result.scalars().first()
    if not quadrant:
        logger.error(f"Quadrante com ID {planting.quadrant_id} não encontrado")
        return {}
    
    result = await db.execute(select(Terrain).where(Terrain.id == quadrant.terrain_id))
    terrain = result.scalars().first()
    if not terrain:
        logger.error(f"Terreno com ID {quadrant.terrain_id} não encontrado")
        return {}
    
    # 3. Buscar os parâmetros do terreno
    result = await db.execute(
        select(TerrainParameters).where(TerrainParameters.terrain_id == terrain.id)
    )
    terrain_params = result.scalars().first()
    
    if not terrain_params:
        logger.error(f"Parâmetros do terreno com ID {terrain.id} não encontrados")
        return {}
    
    # 4. Carregar efeitos para o tipo de insumo
    input_type = input_record.type
    quantity = input_record.quantity
    
    effects = INPUT_EFFECTS.get(input_type, {})
    if not effects:
        logger.warning(f"Nenhum efeito definido para o tipo de insumo: {input_type}")
        return {}
    
    # 5. Calcular os novos valores para os parâmetros afetados
    param_updates = {}
    effects_details = []  # Lista para armazenar detalhes dos efeitos
    plant_effects = {}    # Dicionário para armazenar efeitos nas plantas
    
    for param_name, effect_config in effects.items():
        # Caso especial para days_sem_rega
        if param_name == "days_sem_rega" and input_type == "água":
            # Resetar para 0 independente da quantidade
            if hasattr(planting, "days_sem_rega"):
                old_value = planting.days_sem_rega
                planting.days_sem_rega = 0
                # Registrar o efeito na planta
                plant_effects["days_sem_rega"] = {
                    "before": old_value,
                    "after": 0,
                    "change": -old_value
                }
            continue
        
        # Para parâmetros normais, calcular o efeito baseado na quantidade
        current_value = getattr(terrain_params, param_name, 0)
        base_effect = effect_config.get("base_effect", 0)
        quantity_factor = effect_config.get("quantity_factor", 0)
        
        effect_value = base_effect + (quantity_factor * quantity)
        new_value = current_value + effect_value
        
        # Aplicar limites se definidos
        if param_name in PARAMETER_LIMITS:
            min_val, max_val = PARAMETER_LIMITS[param_name]
            new_value = max(min_val, min(new_value, max_val))
        
        param_updates[param_name] = new_value
        logger.info(f"Parâmetro {param_name} atualizado: {current_value} -> {new_value} (efeito: {effect_value})")
        
        # Registrar detalhes do efeito para retorno
        effects_details.append({
            "parameter": param_name,
            "before": current_value,
            "after": new_value,
            "change": effect_value
        })
    
    # 6. Atualizar os parâmetros do terreno no banco de dados
    if param_updates:
        # Implementação simplificada para a versão assíncrona - adaptada conforme necessário
        for param_name, new_value in param_updates.items():
            setattr(terrain_params, param_name, new_value)
        
        # Se aplicamos "água", resetar days_sem_rega do plantio
        if input_type == "água" and hasattr(planting, "days_sem_rega"):
            planting.days_sem_rega = 0
        
        await db.commit()
        await db.refresh(terrain_params)
        
        logger.info(f"Parâmetros do terreno atualizados com sucesso: {param_updates}")
        # Retornar resultados mais detalhados
        return {
            "updates": param_updates,
            "effects": effects_details,
            "terrain_id": terrain.id,
            "quadrant_id": quadrant.id,
            "plant_effects": plant_effects if plant_effects else None
        }
    
    # Se não houver atualizações, retornar dicionário vazio estruturado
    return {
        "updates": param_updates,
        "effects": effects_details,
        "terrain_id": terrain.id if terrain else None,
        "quadrant_id": quadrant.id if quadrant else None,
        "plant_effects": plant_effects if plant_effects else None
    }
