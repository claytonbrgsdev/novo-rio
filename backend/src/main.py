from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from . import models  # registra todos os modelos para criação de tabelas
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from .services.scheduler import start_scheduler, shutdown_scheduler

dsn = os.getenv("SENTRY_DSN")
if dsn:
    sentry_sdk.init(
        dsn=dsn,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=1.0,
        environment=os.getenv("ENVIRONMENT", "development"),
    )

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
from .api_async.agents import router as agents_async_router
from .api_async.climate_condition import router as climate_async_router
from .api_async.badge import router as badge_async_router
from .api.eko import router as eko_router
from .api.plantings import router as plantings_router
from .api.species import router as species_router
from .api.admin import router as admin_router

tags_metadata = [
    {"name": "players", "description": "CRUD de jogadores e gerenciamento de saldo"},
    {"name": "terrains", "description": "CRUD de terrenos e parâmetros de evolução"},
    {"name": "actions", "description": "Execução de ações no terreno"},
    {"name": "shop_items", "description": "CRUD de itens na loja"},
    {"name": "purchases", "description": "Processar compras de itens"},
    {"name": "climate_conditions", "description": "Registro e consulta de condições climáticas"},
    {"name": "badges", "description": "CRUD de badges e conquistas"},
    {"name": "whatsapp", "description": "Entrada de comandos via WhatsApp"},
    {"name": "agents", "description": "Listar agentes por quadrante do terreno"},
]

app = FastAPI(
    title="Novo Rio Reforestation Game Backend",
    description="API para gerenciar jogadores, terrenos, ações, loja e clima no jogo de reflorestamento",
    version="0.1.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1, "docExpansion": "none"},
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
app.include_router(agents_async_router)
app.include_router(climate_async_router)
app.include_router(badge_async_router)
app.include_router(eko_router)
app.include_router(plantings_router)
app.include_router(species_router)
app.include_router(admin_router)

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
    # Criar esquema e seeds iniciais
    Base.metadata.create_all(bind=engine)
    # Inicia scheduler de ticks de plantas
    start_scheduler()
    from .scripts.seed import seed_players, seed_terrains
    seed_players()
    seed_terrains()

@app.on_event("shutdown")
def shutdown():
    # Encerra scheduler
    shutdown_scheduler()

@app.get("/")
def root():
    return {"message": "Novo Rio backend inicializado!"}
