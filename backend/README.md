# Novo Rio Reforestation Game Backend

API construída com FastAPI e SQLAlchemy para gerenciar jogadores, terrenos, ações, itens, badges e condições climáticas.

## 📦 Dependências
Dependências testadas:
- Python >=3.13
- fastapi==0.95.2
- SQLAlchemy>=2.0.20,<2.1
- pydantic>=1.10.17,<2.0
- redis>=4.6.0,<5.0.0
- httpx>=0.23.0
- pytest>=7.0.0
- aiosqlite

## 📦 Instalação

```bash
# clonar repositório
git clone <repo-url>
cd backend

# criar ambiente virtual e instalar dependências
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 🌐 Configuração

Crie um arquivo `.env` com variáveis:
```env
DATABASE_URL=sqlite:///./db.sqlite3
SENTRY_DSN=<your_sentry_dsn>
ENVIRONMENT=development
REDIS_URL=redis://localhost
OLLAMA_URL=http://127.0.0.1:11434
LLM_MODEL=llama3.1:8b
```

## 🚀 Iniciando localmente

```bash
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 Documentação da API

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🔍 Testes

```bash
pytest
```

## 🥗 Seeds

Para popular dados iniciais execute:
```bash
python src/scripts/seed.py
```

## 🔗 Endpoints principais

- `/players` — CRUD de jogadores
- `/terrains` — CRUD de terrenos
- `/actions` — CRUD de ações
- `/shop_items` — CRUD de itens na loja
- `/purchases` — Processar compras de itens
- `/climate_conditions` — CRUD de condições climáticas
- `/badges` — CRUD de badges e conquistas
- `/whatsapp/message` — integração de comandos via WhatsApp
- `/eko/` — proxy de chat para LLM, com contexto de conversa via Redis
- `/eko/{conversation_id}` (DELETE) — limpa o contexto de conversa no Redis
<!-- Endpoints assíncronos -->
- `/async/players` — CRUD assíncrono de jogadores
- `/async/shop-items` — CRUD assíncrono de itens da loja
- `/async/purchases` — Processamento de compras de itens (assíncrono)
- `/async/terrains` — CRUD assíncrono de terrenos
- `/async/climate-conditions` — CRUD assíncrono de condições climáticas
- `/async/badges` — CRUD assíncrono de badges
- `/async/agents` — Listagem de agentes por quadrante (assíncrono)

## 📐 Grid de Terrenos e Agentes

Cada terreno é composto por **15 quadrantes** organizados em 3 linhas por 5 colunas. Em cada quadrante podem existir até **15 agentes**, totalizando **225 agentes** por terreno de cada jogador. Esses agentes podem executar ações (regar, colher, etc.) via nossos endpoints assíncronos.

## 🔄 Migrations

```bash
# Instale Alembic (se ainda não tiver):
$ pip install alembic

# Gere as tabelas iniciais e índices de performance:
$ alembic upgrade head
```

## 🧩 Extensão de Ações via Registry

Para adicionar novas ações no ciclo de evolução do terreno, utilize o `ActionRegistry`:

```python
from src.services.action_registry import registry
from src.schemas.terrain_parameters import TerrainParametersUpdate
from src.crud.terrain_parameters import update_terrain_parameters

@registry.register("nova_acao")
def handle_nova_acao(db, terrain_id, params):
    # params: objeto TerrainParameters atual
    # Exemplo: modifica fertilidade
    new_fert = (params.fertility or 0) + 5
    update_terrain_parameters(
        db,
        terrain_id,
        TerrainParametersUpdate(fertility=new_fert)
    )
```

O handler será executado sempre que `update_terrain` receber `action_name="nova_acao"`.

## 🛠 Próximos passos

- Documentar regras de negócio de evolução de terreno (plantar, regar, colher)
- Implementar integração de clima no ciclo de evolução
- Adicionar testes de integração e E2E
