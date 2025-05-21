from fastapi import FastAPI
from dotenv import load_dotenv

# Load .env file before other modules that might depend on environment variables
load_dotenv()

from src.db import get_db, build_engine, build_session, AsyncSessionLocal, async_engine, Base
from fastapi.middleware.cors import CORSMiddleware
from src import models  # registra todos os modelos para criação de tabelas
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from src.services.scheduler import start_scheduler, shutdown_scheduler

def create_app(session_local=None, engine=None):
    dsn = os.getenv("SENTRY_DSN")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            integrations=[FastApiIntegration(), SqlalchemyIntegration()],
            traces_sample_rate=1.0,
            environment=os.getenv("ENVIRONMENT", "development"),
        )

    app = FastAPI(
        title="Novo Rio Reforestation Game Backend",
        description="API para gerenciar jogadores, terrenos, ações, loja e clima no jogo de reflorestamento",
        version="0.1.0",
        openapi_tags=[
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
        ],
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        swagger_ui_parameters={"defaultModelsExpandDepth": -1, "docExpansion": "none"},
    )

    # Importa routers
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
    from .api.character_customization import router as character_customization_router
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
    from .api_async.species import router as species_async_router
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
    app.include_router(whatsapp_router, prefix="/api/v1", tags=["whatsapp"])
    app.include_router(player_router, prefix="/api/v1/players", tags=["players"])
    app.include_router(terrain_router, prefix="/api/v1/terrains", tags=["terrains"])
    app.include_router(badge_router, prefix="/api/v1/badges", tags=["badges"])
    app.include_router(climate_router, prefix="/api/v1/climate-conditions", tags=["climate-conditions"])
    app.include_router(shop_item_router, prefix="/api/v1/shop-items", tags=["shop-items"])
    app.include_router(purchase_router, prefix="/api/v1/purchases", tags=["purchases"])
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(eko_router, prefix="/api/v1/eko", tags=["eko"])
    app.include_router(plantings_router, prefix="/api/v1/plantings", tags=["plantings"])
    app.include_router(species_router, prefix="/api/v1/species", tags=["species"])
    app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
    app.include_router(tools_router, prefix="/api/v1/tools", tags=["tools"])
    app.include_router(action_router, prefix="/api/v1/actions", tags=["actions"])
    app.include_router(quadrant_router, prefix="/api/v1/quadrants", tags=["quadrants"])
    app.include_router(character_customization_router, prefix="/api/v1/character", tags=["character"])
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
    
    # Inclui roteadores assíncronos - os prefixos já estão definidos nos próprios roteadores
    app.include_router(auth_async_router, prefix="/api/v1")
    app.include_router(player_async_router, prefix="/api/v1")
    app.include_router(terrain_async_router, prefix="/api/v1")
    app.include_router(plantings_async_router, prefix="/api/v1")
    app.include_router(inputs_async_router, prefix="/api/v1")
    app.include_router(character_async_router, prefix="/api/v1")
    app.include_router(player_profile_async_router, prefix="/api/v1")
    app.include_router(player_progress_async_router, prefix="/api/v1")
    app.include_router(player_settings_async_router, prefix="/api/v1")
    app.include_router(quadrant_async_router, prefix="/api/v1")
    app.include_router(species_async_router, prefix="/api/v1")

    # CORS configuration
    origins = [
        "http://localhost:3000",  # Frontend development server
        "http://localhost:3001",  # Potential alternative frontend port
        # Add production domain here when ready
        # "https://your-production-domain.com",
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Content-Length", "X-Total-Count"],
    )

    # Rota para exportar o esquema OpenAPI
    @app.get("/openapi.json", include_in_schema=False)
    async def get_open_api_endpoint():
        return app.openapi()

    # Rota para baixar o esquema OpenAPI
    @app.get("/download-openapi", include_in_schema=False)
    async def download_openapi():
        openapi_schema = app.openapi()
        
        # Criar diretório se não existir
        os.makedirs("docs", exist_ok=True)
        
        # Salvar o esquema OpenAPI
        with open("docs/openapi.json", "w") as f:
            json.dump(openapi_schema, f, indent=2)
        
        return open("docs/openapi.json", "rb")

    @app.on_event("startup")
    async def startup():
        # Explicitly import models to ensure Base.metadata is populated
        import os
        import logging
        from src import models

        logger = logging.getLogger(__name__)

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Verifica se deve iniciar o scheduler após as migrações
        scheduler_after_migrations = os.getenv("SCHEDULER_START_AFTER_MIGRATIONS", "false").lower() == "true"
        
        if not scheduler_after_migrations:
            # Inicia scheduler de ticks de plantas
            logger.info("Iniciando scheduler no startup da aplicação")
            start_scheduler(AsyncSessionLocal)
        else:
            logger.info("Scheduler será iniciado após a execução das migrações do Alembic")
        
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

# Health check endpoint para monitoramento (definido no nível do módulo)
@app.get("/health")
def health_check():
    return {"status": "ok"}
