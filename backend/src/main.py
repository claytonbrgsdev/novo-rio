from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from . import models  # registra todos os modelos para criação de tabelas
from .api.whatsapp import router as whatsapp_router
from .api.player import router as player_router
from .api.terrain import router as terrain_router
from .api.badge import router as badge_router
from .api.climate_condition import router as climate_router
from .api.shop_item import router as shop_item_router
from .api.purchase import router as purchase_router
from .api_async.shop_item import router as shop_item_async_router
from .api_async.purchase import router as purchase_async_router
from .api_async.terrain import router as terrain_async_router
from .api_async.player import router as player_async_router

tags_metadata = [
    {"name": "players", "description": "CRUD de jogadores e gerenciamento de saldo"},
    {"name": "terrains", "description": "CRUD de terrenos e parâmetros de evolução"},
    {"name": "actions", "description": "Execução de ações no terreno"},
    {"name": "shop_items", "description": "CRUD de itens na loja"},
    {"name": "purchases", "description": "Processar compras de itens"},
    {"name": "climate_conditions", "description": "Registro e consulta de condições climáticas"},
    {"name": "badges", "description": "CRUD de badges e conquistas"},
    {"name": "whatsapp", "description": "Entrada de comandos via WhatsApp"},
]

app = FastAPI(
    title="Novo Rio Reforestation Game Backend",
    description="API para gerenciar jogadores, terrenos, ações, loja e clima no jogo de reflorestamento",
    version="0.1.0",
    openapi_tags=tags_metadata,
)
app.include_router(whatsapp_router)
app.include_router(player_router)
app.include_router(terrain_router)
app.include_router(badge_router)
app.include_router(climate_router)
app.include_router(shop_item_router)
app.include_router(purchase_router)
app.include_router(shop_item_async_router)
app.include_router(purchase_async_router)
app.include_router(terrain_async_router)
app.include_router(player_async_router)

# Importar e incluir routers futuramente
# from api import action
# app.include_router(action.router)

# CORS (enable frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Novo Rio backend inicializado!"}
