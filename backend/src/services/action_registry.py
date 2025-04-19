from typing import Callable, Dict
from sqlalchemy.orm import Session
from ..crud.terrain_parameters import update_terrain_parameters
from ..crud.player import update_player_balance
from ..crud.terrain import get_terrain
from ..schemas.terrain_parameters import TerrainParametersUpdate

class ActionRegistry:
    def __init__(self):
        self._handlers: Dict[str, Callable[[Session, int, any], None]] = {}

    def register(self, name: str):
        def decorator(fn: Callable[[Session, int, any], None]):
            self._handlers[name.lower()] = fn
            return fn
        return decorator

    def has(self, action_name: str) -> bool:
        """Retorna True se existir handler registrado para `action_name`"""
        return action_name.lower() in self._handlers

    def handle(self, action_name: str, db: Session, terrain_id: int, params: any):
        handler = self._handlers.get(action_name.lower())
        if handler:
            handler(db, terrain_id, params)
        else:
            print(f"[action_registry] Handler não encontrado para ação '{action_name}'")

# Instância global do registry
registry = ActionRegistry()

# preço fixo por unidade de cobertura
PRICE_PER_UNIT = 1.0

# Handlers padrão
@registry.register("plantar")
def handle_plantar(db: Session, terrain_id: int, params: any):
    new_coverage = (params.coverage or 0) + 10
    new_cycles = (params.regeneration_cycles or 0) + 1
    update_in = TerrainParametersUpdate(
        coverage=new_coverage,
        regeneration_cycles=new_cycles,
    )
    update_terrain_parameters(db, terrain_id, update_in)
    print(f"[action_registry] plantar: coverage {new_coverage}, cycles {new_cycles}")

@registry.register("regar")
@registry.register("water")
def handle_regar(db: Session, terrain_id: int, params: any):
    new_cycles = (params.regeneration_cycles or 0) + 1
    update_in = TerrainParametersUpdate(regeneration_cycles=new_cycles)
    update_terrain_parameters(db, terrain_id, update_in)
    print(f"[action_registry] regar: cycles {new_cycles}")

@registry.register("colher")
@registry.register("harvest")
def handle_colher(db: Session, terrain_id: int, params: any):
    # calcula receita e atualiza saldo do jogador
    terrain = get_terrain(db, terrain_id)
    amount = (params.coverage or 0) * PRICE_PER_UNIT
    if terrain:
        update_player_balance(db, terrain.player_id, amount)
    # reseta cobertura após colheita
    new_coverage = 0
    update_in = TerrainParametersUpdate(coverage=new_coverage)
    update_terrain_parameters(db, terrain_id, update_in)
    print(f"[action_registry] colher: coverage {new_coverage}")
