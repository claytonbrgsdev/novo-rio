#!/bin/bash

# Cores para mensagens de log
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Diretório do projeto
PROJECT_DIR=$(pwd)
REPORT_FILE="${PROJECT_DIR}/production_deployment_report.md"

# Iniciar o relatório de implantação
echo "# Relatório de Implantação em Produção" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Informações da Implantação" >> $REPORT_FILE
echo "- **Data e Hora:** $(date)" >> $REPORT_FILE
echo "- **Ambiente:** Produção" >> $REPORT_FILE
echo "- **Branch:** master" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.production.yml" ]; then
    log_error "Este script deve ser executado do diretório raiz do projeto"
    echo "❌ **Erro:** O script não foi executado do diretório raiz do projeto" >> $REPORT_FILE
    exit 1
fi

# Etapa 1: Atualizar o código da branch master
log_info "Etapa 1: Atualizando o código da branch master..."
echo "## Atualização do Código" >> $REPORT_FILE

git checkout master
if [ $? -ne 0 ]; then
    log_error "Falha ao mudar para a branch master"
    echo "❌ **Erro:** Falha ao mudar para a branch master" >> $REPORT_FILE
    exit 1
fi

git pull origin master
if [ $? -ne 0 ]; then
    log_error "Falha ao atualizar o código da branch master"
    echo "❌ **Erro:** Falha ao atualizar o código da branch master" >> $REPORT_FILE
    exit 1
fi

log_info "Código atualizado com sucesso"
echo "✅ Código atualizado com sucesso da branch master" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Etapa 2: Parar e remover contêineres existentes
log_info "Etapa 2: Parando e removendo contêineres existentes..."
echo "## Parada de Serviços" >> $REPORT_FILE

docker-compose -f docker-compose.production.yml down
if [ $? -ne 0 ]; then
    log_warn "Aviso: Falha ao parar contêineres existentes, talvez eles não existam ainda"
    echo "⚠️ **Aviso:** Falha ao parar contêineres existentes, continuando..." >> $REPORT_FILE
else
    log_info "Contêineres parados e removidos com sucesso"
    echo "✅ Serviços anteriores parados com sucesso" >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

# Etapa 3: Construir e iniciar os novos contêineres
log_info "Etapa 3: Construindo e iniciando os novos contêineres..."
echo "## Implantação de Serviços" >> $REPORT_FILE

# Construir as imagens primeiro
docker-compose -f docker-compose.production.yml build
if [ $? -ne 0 ]; then
    log_error "Falha ao construir as imagens"
    echo "❌ **Erro:** Falha ao construir as imagens Docker" >> $REPORT_FILE
    exit 1
fi

# Iniciar os contêineres
docker-compose -f docker-compose.production.yml up -d
if [ $? -ne 0 ]; then
    log_error "Falha ao iniciar os contêineres"
    echo "❌ **Erro:** Falha ao iniciar os serviços" >> $REPORT_FILE
    exit 1
fi

log_info "Contêineres construídos e iniciados com sucesso"
echo "✅ Serviços implantados com sucesso" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Etapa 4: Aguardar o backend ficar pronto
log_info "Etapa 4: Aguardando o backend ficar pronto..."
echo "## Verificação de Saúde" >> $REPORT_FILE

MAX_RETRIES=30
RETRY_INTERVAL=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if nc -z localhost 8084; then
        log_info "Backend está pronto na porta 8084"
        echo "✅ Backend está pronto na porta 8084" >> $REPORT_FILE
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT+1))
    log_info "Aguardando o backend iniciar (tentativa $RETRY_COUNT/$MAX_RETRIES)..."
    sleep $RETRY_INTERVAL
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log_error "Backend não ficou pronto após $MAX_RETRIES tentativas"
        echo "❌ **Erro:** Backend não ficou pronto após $MAX_RETRIES tentativas" >> $REPORT_FILE
        echo "" >> $REPORT_FILE
        echo "## Status Final" >> $REPORT_FILE
        echo "❌ **Implantação falhou:** Backend não iniciou corretamente" >> $REPORT_FILE
        exit 1
    fi
done

echo "" >> $REPORT_FILE

# Etapa 5: Executar testes de smoke
log_info "Etapa 5: Executando testes de smoke..."
echo "## Testes de Smoke" >> $REPORT_FILE

bash scripts/run_production_smoke_tests.sh "http://localhost:8084"
if [ $? -ne 0 ]; then
    log_warn "Alguns testes de smoke falharam, verifique o relatório para mais detalhes"
    echo "⚠️ **Aviso:** Alguns testes de smoke falharam. Verifique o relatório detalhado para mais informações." >> $REPORT_FILE
else
    log_info "Todos os testes de smoke passaram com sucesso"
    echo "✅ Todos os testes de smoke passaram com sucesso" >> $REPORT_FILE
fi

# Anexar o relatório de testes de smoke
if [ -f "production_smoke_test_report.md" ]; then
    echo "" >> $REPORT_FILE
    echo "### Detalhes dos Testes de Smoke" >> $REPORT_FILE
    cat production_smoke_test_report.md >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# Etapa 6: Finalizar relatório
log_info "Etapa 6: Finalizando relatório de implantação..."
echo "## Status Final" >> $REPORT_FILE
echo "✅ **Implantação concluída com sucesso**" >> $REPORT_FILE
echo "- **Data e Hora de Conclusão:** $(date)" >> $REPORT_FILE
echo "- **URL do Backend:** http://localhost:8084" >> $REPORT_FILE

log_info "Implantação em produção concluída com sucesso"
log_info "Relatório de implantação salvo em: $REPORT_FILE"

exit 0
