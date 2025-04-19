# Todo List - Projeto RPG de Reflorestamento

## 1. Ambiente Local & Infraestrutura
- [x] Configurar Docker/Docker Compose para desenvolvimento local (Must)
- [x] Configurar CI/CD com GitHub Actions (frontend: Vercel; backend: Railway) (Must)
- [ ] Planejar escalabilidade horizontal (Should)

## 2. Monitoramento & Segurança
- [ ] Configurar Sentry e logs de plataforma (Must)
- [ ] Implementar alertas para falhas no WhatsApp (Must)
- [ ] Garantir anonimização e proteção de dados sensíveis (Must)

## 3. Documentação & Qualidade
- [ ] Atualizar README e diagramas Mermaid (Must)
- [ ] Documentar API com Swagger/Redoc (Must)
- [ ] Documentar setup de Phaser (cenas, sprites, bundler) (Should)
- [ ] Revisar e atualizar documentos em docs/entities (Should)
- [ ] Validar consistência entre PRD, user-flow e state-management (Should)
- [ ] Garantir linting e padrões (ESLint, PEP8, PEP257) (Must)
- [ ] Revisões de código via Pull Request (Must)

## 4. Integração WhatsApp
- [x] Criar endpoint POST /whatsapp-message para comandos (Must) (stubbed)
- [x] Processar NLP e mapear para ações predefinidas (Must)
- [ ] Implementar retry e fallback em webhooks (Should)
- [ ] Implementar onboarding via WhatsApp (perfil e terreno padrão) (Should)
- [x] Tratar erros: comandos não reconhecidos e limites diários (Must)

## 5. Front-end (React + Phaser)

### 5.1. Setup & State Management
- [x] Inicializar projeto Phaser integrado ao React (Must)
- [x] Configurar bundler (Vite) para Phaser (Should)
- [x] Configurar React Query + Redux Persist (Must)
- [x] Configurar variáveis de ambiente (.env) para URLs e keys (Must)
- [ ] Migrar assets 3D para sprites 2D (Should)

### 5.2. Funcionalidades 2D
- [x] Renderizar terrenos 2D com Phaser (Must)
- [ ] Exibir rankings e indicadores no Mapa Geral (Must)
- [x] Exibir status do terreno no Dashboard (Must)
- [ ] Ações manuais na UI (plantar, regar, colher) (Must)
- [ ] Implementar lazy loading e otimizações de performance (Should)

### 5.3. Testes (Front-end)
- [ ] Testes unitários com Jest/React Testing Library (Must)
- [ ] Testes E2E com Cypress (Should)

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
  - [ ] Migrar endpoints assíncronos restantes (terrain, player, clima, badge)
- [ ] Testes unitários com Pytest (Must)
- [ ] Testes de integração e E2E para fluxo via WhatsApp (Must)

## 7. Finalização & Deploy
- [ ] Testar fluxo completo (WhatsApp → Back-end → UI) em staging (Must)
- [ ] Revisar cobertura de testes ≥ 80% (Must)
- [ ] Documentar configurações de ambiente (dev/staging/prod) (Must)
- [ ] Checklist de segurança e privacidade antes do deploy (Must)

## 8. Extensibilidade & Evolução de Entidades e Ações
- [ ] Definir modelo de dados genérico para entidades e ações com parâmetros flexíveis (Must)
- [ ] Implementar registry/factory para registro dinâmico de novas ações e entidades (Should)
- [ ] Documentar padrão de extensão para adicionar futuras variações de ações/entidades (Should)

## Notas Recentes
- Atualizado seed.py para atribuir `player_id` ao criar terrenos e executar sem erros.
- Seed inicial executada: 3 jogadores e 3 terrenos criados.
- Removido header padrão do React no App.jsx
