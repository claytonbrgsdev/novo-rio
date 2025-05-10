"""
Script de seeds iniciais para o banco de dados.
Executa criação de jogadores e terrenos padrão.
"""
# Ajuste de path para resolver imports quando executado como script
import sys, os
# adiciona a raiz do backend (parent de 'src') ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.crud_async.player import create_player_async, get_players_async
from src.schemas.player import PlayerCreate
from src.crud_async.terrain import create_terrain_async, get_terrains_async
from src.schemas.terrain import TerrainCreate
import asyncio

async def seed_players(db):
    existing = await get_players_async(db)
    if not existing:
        defaults = ["Alice", "Bob", "Carol"]
        for name in defaults:
            player = PlayerCreate(name=name)
            await create_player_async(db, player)
        print(f"Seed: {len(defaults)} players created.")
    else:
        print("Seed: players already exist.")


async def seed_terrains(db):
    existing = await get_terrains_async(db)
    if not existing:
        players = await get_players_async(db)
        if not players:
            print("Seed: No players found to assign terrains to. Please seed players first.")
            return
        defaults = ["Floresta", "Rio", "Montanha"]
        for idx, title in enumerate(defaults):
            terrain = TerrainCreate(name=title, player_id=players[idx % len(players)].id)
            await create_terrain_async(db, terrain)
        print(f"Seed: {len(defaults)} terrains created.")
    else:
        print("Seed: terrains already exist.")


def main():
    print("Standalone seeding script execution would require async setup.")
    # Example of how it might look (requires AsyncSessionLocal from db.py):
    # from src.db import AsyncSessionLocal
    # async def _main():
    #     async with AsyncSessionLocal() as session:
    #         await seed_players(session)
    #         await seed_terrains(session)
    #         await session.commit()
    # asyncio.run(_main())


if __name__ == "__main__":
    main()
