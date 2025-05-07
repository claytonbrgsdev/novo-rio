# Todo List - Projeto RPG de Reflorestamento

## 1. Ambiente Local & Infraestrutura
- [x] Configurar Docker/Docker Compose para desenvolvimento local (Must)
- [x] Configurar CI/CD com GitHub Actions (frontend: Vercel; backend: Railway) (Must)
- [ ] Planejar escalabilidade horizontal (Should)

## 2. Monitoramento & Segurança
- [x] Configurar Sentry e logs de plataforma (Must)
- [ ] Implementar alertas para falhas no WhatsApp (Must)
- [ ] Garantir anonimização e proteção de dados sensíveis (Must)
- [ ] Monitorar e registrar falhas na comunicação com o serviço LLM/Ollama (Must)
- [ ] Garantir proteção de prompts e logs sensíveis enviados à LLM (Must)

## 3. Documentação & Qualidade
- [ ] Atualizar README e diagramas Mermaid (Must)
- [x] Documentar API com Swagger/Redoc (Must)
- [ ] Documentar setup de Phaser (cenas, sprites, bundler) (Should)
- [ ] Revisar e atualizar documentos em docs/entities (Should)
- [ ] Validar consistência entre PRD, user-flow e state-management (Should)
- [ ] Garantir linting e padrões (ESLint, PEP8, PEP257) (Must)
- [ ] Revisões de código via Pull Request (Must)
- [ ] Documentar arquitetura de integração LLM (Ollama) no README e diagramas (Must)
- [ ] Adicionar exemplos de prompts e respostas LLM na documentação (Should)

## 4. Integração WhatsApp
- [x] Criar endpoint POST /whatsapp-message para comandos (Must) (stubbed)
- [x] Processar NLP e mapear para ações predefinidas (Must)
- [ ] Implementar retry e fallback em webhooks (Should)
- [ ] Implementar onboarding via WhatsApp (perfil e terreno padrão) (Should)
- [x] Tratar erros: comandos não reconhecidos e limites diários (Must)
- [ ] Integrar fluxo WhatsApp → LLM → Backend (Must)
- [ ] Testar fallback para respostas do backend caso a LLM esteja indisponível (Should)

## 5. Front-end (React + Phaser)

### 5.1. Setup & State Management
- [x] Inicializar projeto Phaser integrado ao React (Must)
- [x] Configurar bundler (Vite) para Phaser (Should)
- [x] Configurar React Query + Redux Persist (Must)
- [x] Configurar variáveis de ambiente (.env) para URLs e keys (Must)
- [ ] Migrar assets 3D para sprites 2D (Should)
- [ ] Migrar projeto React/Vite de JavaScript para TypeScript: scaffold Vite+TS, renomear arquivos para .tsx/.ts, configurar tsconfig.json, ESLint e Prettier (Must)
- [ ] Criar type definitions/interfaces para componentes, hooks e modelos de dados (Must)
- [ ] Revisar estrutura de pastas e componentes para conformidade com TypeScript (Should)
- [ ] Configurar camada de serviço para comunicação com LLM (Ollama) via backend (Must)
- [ ] Implementar contexto global para resposta da EKO (LLM) (Must)

### 5.2. Funcionalidades 2D
- [x] Renderizar terrenos 2D com Phaser (Must)
- [ ] Exibir rankings e indicadores no Mapa Geral (Must)
- [x] Exibir status do terreno no Dashboard (Must)
- [x] Ações manuais na UI (plantar, regar, colher) (Must)
- [x] Implementar lazy loading e otimizações de performance (Should)
- [x] Exibir respostas da EKO (LLM) no bloco superior da interface (Must)
- [ ] Sincronizar estado visual do personagem com comandos interpretados pela LLM (Must)

### 5.3. Testes (Front-end)
- [x] Testes unitários com Jest/React Testing Library (Must)
- [ ] Testes E2E com Cypress (Should)

### 5.4. Integração do Sketch farm-game-interface
- [ ] Definir e justificar abordagem de integração (micro frontend via iframe) (Must)
- [ ] Configurar farm-game-interface Next.js para rodar na porta 3000 (Should)
- [x] Criar rota `/farm` no Vite com `<iframe src="http://localhost:3000" />` (Should)
- [ ] Garantir isolamento e comunicação entre micro frontends (postMessage) (Should)
- [ ] Garantir que comandos/ações vindos do micro frontend também passem pelo fluxo LLM (Should)

## 6. Back-end (FastAPI + ORM)
- [x] CRUD de jogadores, terrenos, ações, itens, badges e condições climáticas (Must)  
  - Modelos, schemas e endpoints criados para todas as entidades principais
  - Migrações Alembic aplicadas e testadas
- [x] Processar comandos do WhatsApp e registrar ações (Must)  
  - Endpoint `/whatsapp/message` criado e stub de criação de ação implementado
- [x] Configurar migrações Alembic (Should)
  - [x] Seeds iniciais
- [x] Implementar lógica de evolução do terreno e regras de negócio (Must)
- [x] Endpoints assíncronos e índices SQL para performance (Should)
  - [x] Migrar endpoints assíncronos restantes (terrain, player, clima, badge)
- [x] Implementar endpoint `/eko` ou `/llm` para repasse de prompts e respostas entre UI e LLM (Must)
- [x] Integrar backend ao Ollama via API REST (Must)
- [x] Implementar cache e controle de contexto conversacional para EKO (Must)
- [x] Tratar erros e timeouts do Ollama, retornando fallback amigável ao usuário (Must)
- [x] Logar prompts e respostas para auditoria e debugging (Should)
- [x] Permitir parametrização do modelo LLM via env/config (Should)
- [x] Endpoint DELETE `/eko/{conversation_id}` para limpeza de contexto no Redis (Should)
- [x] Testes automatizados para endpoint `/eko` (happy path, contexto, clear e timeout) (Should)

## 7. Finalização & Deploy
- [ ] Testar fluxo completo (WhatsApp → Back-end → UI) em staging (Must)
- [ ] Revisar cobertura de testes ≥ 80% (Must)
- [ ] Documentar configurações de ambiente (dev/staging/prod) (Must)
- [ ] Checklist de segurança e privacidade antes do deploy (Must)
- [ ] Testar fluxo completo (WhatsApp → LLM → Back-end → UI) em staging (Must)
- [ ] Validar UX de respostas da EKO em todos os dispositivos (Should)

## 8. Extensibilidade & Evolução de Entidades e Ações
- [ ] Definir modelo de dados genérico para entidades e ações com parâmetros flexíveis (Must)
- [ ] Implementar registry/factory para registro dinâmico de novas ações e entidades (Should)
- [ ] Documentar padrão de extensão para adicionar futuras variações de ações/entidades (Should)
- [ ] Documentar padrão para adicionar novos “assistentes” LLM ou modelos alternativos (Should)
- [ ] Garantir que novas ações e entidades possam ser interpretadas dinamicamente pela LLM (Should)

## Notas Recentes
- Atualizado seed.py para atribuir `player_id` ao criar terrenos e executar sem erros.
- Seed inicial executada: 3 jogadores e 3 terrenos criados.
- Removido header padrão do React no App.jsx
- Criado hook `useBadges`, componentes `BadgeList` e `BadgeView` e rota `/badges`.
- Criado hook `useClimateConditions`, componente `ClimateConditionsView` e rota `/climate-conditions`.
