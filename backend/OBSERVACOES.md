# Observações Arquiteturais do Backend “Novo Rio”

## 1. db.py  
- Lê `DATABASE_URL` da variável de ambiente (fallback para `sqlite:///./test.db`).  
- Define URLs **sync** (`DATABASE_URL`) e **async** (substitui `sqlite:///` por `sqlite+aiosqlite:///`).  
- Cria **engine** síncrono e `SessionLocal` com SQLAlchemy tradicional (`create_engine`, `sessionmaker`).  
- Tenta importar `sqlalchemy.ext.asyncio`; se disponível, define `get_async_db()` que gera sessões `AsyncSession` via `create_async_engine` + `aiosqlite`.  
- `Base = declarative_base()` registra classes ORM para criação de tabelas.

## 2. main.py  
- Inicializa Sentry (`SENTRY_DSN`) com integrações FastAPI e SQLAlchemy e `traces_sample_rate=1.0`.  
- Importa e registra routers **sync** (`src/api/...`) e **async** (`src/api_async/...`).  
- Configura CORS liberando tudo (`allow_origins=["*"]`).  
- `@app.on_event("startup")`:  
  - `Base.metadata.create_all(bind=engine)` cria todas as tabelas.  
  - Chama seeds (`seed_players()`, `seed_terrains()`).  
  - Inicia scheduler de ticks de plantas (`start_scheduler()`).  
- `@app.on_event("shutdown")`: encerra scheduler (`shutdown_scheduler()`).  
- Rota raiz (`GET /`) retorna `{"message": "Novo Rio backend inicializado!"}`.

## 3. models/ (SQLAlchemy)  
- **Action**, **Badge**, **ClimateCondition**, **Item**, **PlantStateLog**: tabelas de logs e entidades auxiliares, com `ForeignKey`, índices e `back_populates`.  
- **Planting**: enum de estados (`plant_state_enum`), relaciona `Species`, `Player` e logs.  
- **Player**: armazena ciclo de 6 h (`cycle_start`, `actions_count`), relacionamentos com várias entidades.  
- **Purchase**, **ShopItem**, **Species**, **TerrainParameters**, **Terrain**: campos coerentes e relações bidirecionais configuradas.

## 4. api/ (síncrono)  
- Padrão **`async def` + `run_in_threadpool`** para não bloquear loop de evento:  
  - CRUD de **players**, **purchases**, **shop-items**, **badges**, **climate-conditions**, **plantings**, **terrains**.  
- **`/admin/run-tick`**: dispara `tick_day()` manualmente.  
- **`/eko`**: proxy **async** para LLM com:  
  - Histórico em Redis (`redis.asyncio`),  
  - Chamadas HTTP via `httpx.AsyncClient`,  
  - Captura de erros com Sentry,  
  - TTL de conversas a configurar.  
- **`/whatsapp/message`**: gateway de comandos WhatsApp que:  
  - Valida ciclo de ações (6 h e limite),  
  - Incrementa `actions_count`,  
  - Enfileira `update_terrain` em background,  
  - Retorna `WhatsappMessageOut(reply=…)`.

## 5. api_async/ (rotas assíncronas)
- Pasta `src/api_async/`: versões assíncronas dos endpoints de CRUD e stubs auxiliares.
  - **Padrão**: `async def` + `AsyncSession` de `get_async_db()` cadastrado em `db.py`.
  - Usa diretamente funções `*_async` de `src/crud_async/` (sem `run_in_threadpool`), retornando coroutines.
- **Endpoints stub**:
  - `/async/agents`: gera dados aleatórios de agentes por quadrante; utilizado para demonstração.
- **CRUD assíncrono**:
  - `/async/players`, `/async/purchases`, `/async/shop-items`, `/async/terrains`, `/async/badges`, `/async/climate-conditions`
  - Mesma interface dos CRUDs síncronos, mas:
    - POST, GET, PUT, DELETE usam coroutines de `crud_async`.
    - Tratamento de 404 e erros de negócio (e.g. saldo insuficiente) idêntico aos síncronos.
- Observação:
  - Poderíamos unificar ainda mais sync/async se extraíssemos a lógica comum de rotas ou usássemos adaptadores genéricos.


## 6. schemas/ (Pydantic)  
- **Create/Update**: validam campos de entrada (`*Create`, `*Update`).  
- **Out**: adicionam campos de resposta (`id`, timestamps etc.) e usam `orm_mode=True`.  
- **SpeciesSchema** inclui campos `_scaled` preenchidos pela lógica de lifecycle.  
- Falta schema de saída para **TerrainParameters** se exposto via API.

## 7. crud/ (persistência)
- Pasta `src/crud/`: implementa operações de persistência no banco para cada modelo.
  - **Create**: recebe schema `*Create`, instância o modelo SQLAlchemy, adiciona, commita e refresh.
  - **Read**: funções `get_xxx` (por ID) e `get_xxxs` (lista com `skip`/`limit`).
  - **Update**: busca por ID, aplica `dict(exclude_unset=True)` de update schema, commita e refresh.
  - **Delete**: busca por ID e, se existe, remove e commita.
- Lógica de negócio especial em `create_purchase`: 
  - Verifica existência de player e item, calcula `total_price`, checa saldo, debita o player e cria registro de compra.
- **Sugestões de melhorias**:
  - Extrair `get_db()` para `src/api/deps.py` e usar em todos os routers.
  - Criar helper genérico `get_or_404` para reduzir repetição de 404 nos endpoints.
  - Padronizar parâmetros de paginação (`skip`, `limit`) em todas as rotas GET.
  - Adotar transações compostas para operações múltiplas (e.g. débito + compra) com rollback total em caso de erro.
  - Considerar abstrair crud genérico (create, read, update, delete) em um módulo base.

  ## 8. crud_async/ (persistência assíncrona)
- Pasta `src/crud_async/`: implementa operações de banco usando `AsyncSession` e consultas via `select`.
  - **Create**: instância modelo, `db.add()`, `await db.commit()`, `await db.refresh()`.
  - **Read**: `await db.execute(select(Model).where(...))` + `result.scalars().first()/all()`.
  - **Update**: carrega objeto, aplica `dict(exclude_unset=True)`, `await db.commit()`, `await db.refresh()`.
  - **Delete**: carrega objeto, `await db.delete()`, `await db.commit()`.
- Em `create_purchase_async`:
  - Obtém `Player` com `db.get()`, `ShopItem` via `select`.
  - Calcula `total_price` e lança `ValueError` em caso de saldo insuficiente.
  - Ajusta `player.balance` e salva o `Purchase` de forma assíncrona.
- **Diferenças** em relação ao sync (`src/crud/`):
  - Não usa `run_in_threadpool`.
  - Usa `await` para todas as operações de transação, sem bloquear threads.

## 9. services/ (lógica de negócio)
- Pasta `src/services/`: encapsula regras e fluxos de jogo, separados de CRUD e API.
  - **action_registry.py**  
    - Mantém um registry de handlers para ações (`plantar`, `regar`, `colher`).  
    - Cada handler recebe `(db, terrain_id, params)` e usa `update_terrain_parameters` e `update_player_balance`.  
    - Fácil extensão para novos comandos pelo decorator `@registry.register("nome")`.  
  - **plant_lifecycle.py**  
    - `tick_day()`: executa “tick” diário de plantas:
      - Hot-reload de `species.yml` e aplicação de fator de escala (`TIME_SCALE_FACTOR`).  
      - Incrementa `days_since_planting`, verifica regas recentes (consulta `Action`), transita estados (SEMENTE→MUDINHA→MADURA→COLHIVEL), registra logs em `PlantStateLog`.  
      - Marca plantas como `MORTA` se ultrapassar tolerância de seca (`TOLERANCE_LIMITS`).  
      - Usa sessão síncrona e `commit()/rollback()`.  
  - **scheduler.py**  
    - Usa APScheduler (`BackgroundScheduler`) para agendar `tick_day` a cada 6 horas no startup.  
    - Métodos `start_scheduler()` e `shutdown_scheduler()` amarrados aos eventos FastAPI.  
  - **terrain_service.py**  
    - `update_terrain(action_name, terrain_id)`: fluxo de retry (até 3 tentativas) para criar/obter `TerrainParameters`, invocar `registry.handle`, e aplicar efeitos climáticos recentes (incremento/decremento de `soil_moisture` com base em `ClimateCondition`).  
    - Usa delays (`time.sleep`) e swallowing de exceções silenciosas que podem mascarar erros.  
- **Sugestões de melhorias**:
  - Refatorar blocos de retry para evitar bloqueio de thread (usar async ou executor dedicado).  
  - Extrair lógica de transições de estado em funções menores e testáveis.  
  - Melhor tratamento de exceções (evitar `except: pass`).  
  - Considerar versão async de `plant_lifecycle` e `terrain_service`.

## 10. scripts/ (scripts utilitários)
- Pasta `src/scripts/`: scripts executáveis para tarefas pontuais no backend.
  - **seed.py**: popula dados iniciais no banco:
    - `seed_players()`: adiciona jogadores padrão ["Alice", "Bob", "Carol"] se não existirem.
    - `seed_terrains()`: adiciona terrenos padrão ["Floresta", "Rio", "Montanha"], associando-os ciclicamente a jogadores existentes.
    - Usa `sys.path.insert` para ajustar imports quando executado como script.
  - Sugestões:
    - Substituir hack de `sys.path` por configuração de package ou entrypoint no setup.
    - Adicionar scripts para rodar migrações Alembic ou outras tarefas administrativas.

## 11. tests/ (testes automatizados)
- Pasta `src/tests/`: contém testes automatizados usando `pytest` e `TestClient` do FastAPI.
- **test_async_endpoints.py** valida coberturas de:
  - Listagem de `/async/players` e `/async/terrains`.
  - Stub de `/async/agents` (15 quadrantes, formato de resposta).
  - Detalhamento de `/async/terrains/{id}` (200 ou 404).
  - Listagens de `/async/climate-conditions` e `/async/badges`.
- Sugestões:
  - Adicionar testes para endpoints síncronos (`/players`, `/terrains`, `/purchases` etc.).
  - Incluir cenários de erro (404, limites de ciclo, saldo insuficiente).
  - Cobrir serviços críticos: `tick_day`, `update_terrain` e query de logs.

---

> **Sugestão**: manter este arquivo versionado em `backend/OBSERVACOES.md` e atualizar sempre que alterar a arquitetura ou adicionar novos módulos.