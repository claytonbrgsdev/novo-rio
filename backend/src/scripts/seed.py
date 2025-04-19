"""
Script de seeds iniciais para o banco de dados.
Executa criação de jogadores e terrenos padrão.
"""
# Ajuste de path para resolver imports quando executado como script
import sys, os
# adiciona a raiz do backend (parent de 'src') ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from src.db import SessionLocal
from src.crud.player import create_player, get_players
from src.schemas.player import PlayerCreate
from src.crud.terrain import create_terrain, get_terrains
from src.schemas.terrain import TerrainCreate


def seed_players():
    db = SessionLocal()
    existing = get_players(db)
    if not existing:
        defaults = ["Alice", "Bob", "Carol"]
        for name in defaults:
            player = PlayerCreate(name=name)
            create_player(db, player)
        print(f"Seed: {len(defaults)} players created.")
    else:
        print("Seed: players already exist.")
    db.close()


def seed_terrains():
    db = SessionLocal()
    existing = get_terrains(db)
    if not existing:
        players = get_players(db)
        defaults = ["Floresta", "Rio", "Montanha"]
        for idx, title in enumerate(defaults):
            terrain = TerrainCreate(name=title, player_id=players[idx % len(players)].id)
            create_terrain(db, terrain)
        print(f"Seed: {len(defaults)} terrains created.")
    else:
        print("Seed: terrains already exist.")
    db.close()


def main():
    seed_players()
    seed_terrains()


if __name__ == "__main__":
    main()
