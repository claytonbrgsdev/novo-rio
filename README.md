# Novo Rio

Projeto de reflorestamento gamificado Novo Rio, com backend em FastAPI e frontend em Next.js.

## Estrutura do Projeto
- **Backend**: FastAPI + SQLAlchemy + (SQLite/PostgreSQL)
- **Frontend**: Next.js + React Query + TailwindCSS

## Como Instalar e Executar

### Pré-requisitos
- Python 3.9+
- Node.js 18+
- npm ou yarn

### Backend (FastAPI)

#### Opção 1: SQLite (Desenvolvimento Rápido)

```bash
# Navegar para o diretório do backend
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Atualizar pip
pip install --upgrade pip

# Instalar dependências de desenvolvimento
pip install -r requirements-dev.txt

# Instalar dependências do projeto
pip install -r requirements.txt

# Editar o arquivo .env para usar SQLite (descomente a linha SQLite e comente a linha PostgreSQL)

# Aplicar migrações
alembic upgrade head

# Criar dados de seed para desenvolvimento
python scripts/seed.py

# Executar o servidor de desenvolvimento
uvicorn src.main:app --reload --port 8080
```

#### Opção 2: PostgreSQL (Ambiente Mais Próximo da Produção)

```bash
# Iniciar o PostgreSQL via Docker
docker-compose up -d

# Navegar para o diretório do backend
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Atualizar pip
pip install --upgrade pip

# Instalar dependências de desenvolvimento
pip install -r requirements-dev.txt

# Instalar dependências do projeto
pip install -r requirements.txt

# Editar o arquivo .env para usar PostgreSQL (já configurado por padrão)

# Aplicar migrações
alembic upgrade head

# Criar dados de seed para desenvolvimento
python scripts/seed.py

# Executar o servidor de desenvolvimento
uvicorn src.main:app --reload --port 8080
```

### Frontend (Next.js)

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install
# ou
yarn install

# Executar o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

## Testes

### Testes de Backend

```bash
# Navegar para o diretório do backend
cd backend

# Ativar o ambiente virtual (se ainda não estiver ativo)
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Executar testes com pytest
python -m pytest -v tests/

# Para executar apenas os testes de autenticação
python -m pytest -v tests/test_auth_endpoints.py
```

### Testes de Frontend

```bash
# Navegar para o diretório do frontend
cd frontend

# Executar testes unitários
npm test

# Executar com coverage
npm run test:coverage
```

### Testes E2E com Cypress

Certifique-se de que tanto o backend quanto o frontend estão em execução antes de iniciar os testes E2E.

```bash
# Terminal 1: Iniciar o backend
cd backend
source .venv/bin/activate  # Linux/Mac ou .venv\Scripts\activate para Windows
uvicorn src.main:app --reload --port 8080

# Terminal 2: Iniciar o frontend
cd frontend
npm run dev

# Terminal 3: Executar testes E2E
cd frontend
npm run cypress:run  # Execução headless
# ou
npm run cypress:open  # Interface visual para debugging
```

## Scripts Úteis

### Seed do Banco de Dados

Para criar dados iniciais no banco de dados (usuário de teste, etc.):

```bash
cd backend
python scripts/seed.py
```

Este script cria um usuário `seeded@user.com` com senha `password` para testes e desenvolvimento.

### Reset do Banco para Testes

O endpoint `POST /test/reset` está disponível no ambiente de desenvolvimento para limpar e reinicializar o banco de dados durante testes E2E.

## Migração entre SQLite e PostgreSQL

O projeto suporta tanto SQLite quanto PostgreSQL. Para alternar entre eles:

1. Edite o arquivo `.env` no diretório backend
2. Comente/descomente a URL de conexão apropriada
3. Execute `alembic upgrade head` para aplicar as migrações
4. Execute `python scripts/seed.py` para recriar os dados iniciais

## Limpeza e Preparação para Produção

1. Remova quaisquer `console.log` ou código de debug
2. Configure o arquivo `.env` para apontar para o banco de dados PostgreSQL
3. Ajuste as configurações de CORS no backend para permitir apenas origens conhecidas
4. Revise as dependências e remova quaisquer pacotes desnecessários
5. Construa a versão de produção do frontend com `npm run build`

## Configuração

 Adicione no arquivo `.env` as variáveis:
 ```env
 PLAYER_ACTION_LIMIT=10
 TIME_SCALE_FACTOR=1
 ```

 - **PLAYER_ACTION_LIMIT**: número máximo de ações por ciclo de 6h antes de bloquear (HTTP 429). Default: 10.
 - **TIME_SCALE_FACTOR**: fator de aceleração do tempo. As durações de `germinacao_dias` e `maturidade_dias` são divididas por esse fator (quanto maior, mais rápido o crescimento). Ex: `TIME_SCALE_FACTOR=24` faz cada hora real equivaler a 1 dia de crescimento.
