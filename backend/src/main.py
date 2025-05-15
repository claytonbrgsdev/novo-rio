from fastapi import FastAPI
from dotenv import load_dotenv

# Load .env file before other modules that might depend on environment variables
load_dotenv()

from .db import get_db, build_engine, build_session, AsyncSessionLocal, async_engine, Base
from fastapi.middleware.cors import CORSMiddleware
from . import models  # registra todos os modelos para criação de tabelas
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from .services.scheduler import start_scheduler, shutdown_scheduler

def create_app(session_local=None, engine=None):
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
    from .api.auth import router as auth_router
    from .api_async.shop_item import router as shop_item_async_router
    from .api_async.purchase import router as purchase_async_router
    from .api_async.terrain import router as terrain_async_router
    from .api_async.player import router as player_async_router
    from .api_async.agents import router as agents_async_router
    from .api_async.climate_condition import router as climate_async_router
    from .api_async.badge import router as badge_async_router
    from .api_async.auth import router as auth_async_router
    from .api.eko import router as eko_router
    from .api.plantings import router as plantings_router
    from .api.species import router as species_router
    from .api.admin import router as admin_router
    from .api.tools import router as tools_router
    from .api_async.tools import router as tools_async_router
    from .api.action import router as action_router
    from .api_async.action import router as action_async_router
    from .api.quadrant import router as quadrant_router
    from .api_async.quadrant import router as quadrant_async_router
    from .api_async.plantings import router as plantings_async_router
    from .api.inputs import router as inputs_router
    from .api_async.inputs import router as inputs_async_router
    from .api.character import router as character_router
    from .api_async.character import router as character_async_router
    from .api.player_profile import router as player_profile_router
    from .api.player_progress import router as player_progress_router
    from .api.player_settings import router as player_settings_router
    from .api_async.player_profile import router as player_profile_async_router
    from .api_async.player_progress import router as player_progress_async_router
    from .api_async.player_settings import router as player_settings_async_router
    from .api.player_link import router as player_link_router
    from .api.test import router as test_router

    tags_metadata = [
        {"name": "players", "description": "CRUD de jogadores e gerenciamento de saldo"},
        {"name": "terrains", "description": "CRUD de terrenos e parâmetros de evolução"},
        {"name": "quadrants", "description": "Gerenciamento de quadrantes dos terrenos (subdivisões 5x3)"},
        {"name": "actions", "description": "Execução de ações no terreno"},
        {"name": "shop_items", "description": "CRUD de itens na loja"},
        {"name": "purchases", "description": "Processar compras de itens"},
        {"name": "climate_conditions", "description": "Registro e consulta de condições climáticas"},
        {"name": "badges", "description": "CRUD de badges e conquistas"},
        {"name": "whatsapp", "description": "Entrada de comandos via WhatsApp"},
        {"name": "agents", "description": "Listar agentes por quadrante do terreno"},
        {"name": "tools", "description": "CRUD de ferramentas e propriedades"},
        {"name": "inputs", "description": "Aplicação de insumos agrícolas (água, fertilizante, composto) aos plantios"},
        {"name": "characters", "description": "Gerenciamento de personagens customizados dos jogadores"},
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

    # Se session_local for fornecido, sobrescreve a dependência get_db
    if session_local is not None:
        from fastapi import Depends
        def override_get_db():
            db = session_local()
            try:
                yield db
            finally:
                db.close()
        app.dependency_overrides[get_db] = override_get_db
    app.include_router(whatsapp_router)
    app.include_router(player_router)
    app.include_router(terrain_router)
    app.include_router(badge_router)
    app.include_router(climate_router)
    app.include_router(shop_item_router)
    app.include_router(purchase_router)
    app.include_router(auth_router)
    app.include_router(eko_router)
    app.include_router(plantings_router)
    app.include_router(species_router)
    app.include_router(tools_router)
    app.include_router(tools_async_router)
    app.include_router(admin_router)
    app.include_router(action_router)
    app.include_router(action_async_router)
    app.include_router(auth_async_router)
    app.include_router(quadrant_router)
    app.include_router(quadrant_async_router)
    app.include_router(plantings_async_router)
    app.include_router(inputs_router, prefix="/inputs", tags=["inputs"])
    app.include_router(inputs_async_router, prefix="/async/inputs", tags=["inputs"])
    app.include_router(character_router)
    app.include_router(character_async_router)
    app.include_router(player_profile_router)
    app.include_router(player_progress_router)
    app.include_router(player_settings_router)
    app.include_router(player_profile_async_router)
    app.include_router(player_progress_async_router)
    app.include_router(player_settings_async_router)
    app.include_router(player_link_router)
    app.include_router(test_router)
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
    async def startup():
        # Explicitly import models to ensure Base.metadata is populated
        from src import models

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Inicia scheduler de ticks de plantas
        start_scheduler(AsyncSessionLocal)
        
        from .scripts.seed import seed_players, seed_terrains
        
        # Create a session for seeding
        async with AsyncSessionLocal() as db_session:
            await seed_players(db_session)  
            await seed_terrains(db_session) 
            await db_session.commit() 

    @app.on_event("shutdown")
    def shutdown():
        # Encerra scheduler
        shutdown_scheduler()

    @app.get("/")
    def root():
        return {"message": "Novo Rio backend inicializado!"}

    return app

# Para produção: exporta o app em nível de módulo
app = create_app()
