#!/bin/bash

# Cores para mensagens de log
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# URL base para os testes (produção)
API_URL=${1:-"https://api.novorioapp.com"}
# Altere para a URL correta do seu ambiente de produção

# Caminho para o arquivo de relatório
REPORT_FILE="production_smoke_test_report.md"

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para executar um teste
run_test() {
    local endpoint=$1
    local method=$2
    local auth_required=$3
    local data=$4
    local test_name=$5
    
    # Construir a URL completa
    local full_url="${API_URL}${endpoint}"
    
    # Headers padrão
    local headers="-H 'Content-Type: application/json'"
    
    # Se autenticação for necessária, adicionar o token
    if [ "$auth_required" = "true" ] && [ ! -z "$TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $TOKEN'"
    fi
    
    # Construir o comando curl
    local cmd="curl -s -X $method $headers"
    
    # Adicionar dados para POST/PUT
    if [ ! -z "$data" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    cmd="$cmd $full_url"
    
    # Executar o comando
    log_info "Testing endpoint: $endpoint ($method)"
    local response=$(eval $cmd)
    local http_code=$(eval $cmd -w "%{http_code}" -o /dev/null)
    
    # Verificar código de status HTTP
    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
        log_info "✅ $test_name - OK ($http_code)"
        echo "- ✅ **$test_name** - OK ($http_code)" >> $REPORT_FILE
        return 0
    else
        log_error "❌ $test_name - Failed ($http_code)"
        echo "- ❌ **$test_name** - Failed ($http_code)" >> $REPORT_FILE
        echo "  - Response: \`$response\`" >> $REPORT_FILE
        return 1
    fi
}

# Preparar o relatório
echo "# Smoke Test Report - Production Environment" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Environment Information" >> $REPORT_FILE
echo "- **API URL:** $API_URL" >> $REPORT_FILE
echo "- **Date:** $(date)" >> $REPORT_FILE
echo "- **Environment:** Production" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Test Results" >> $REPORT_FILE

# Iniciar os testes
log_info "Starting smoke tests on $API_URL"

# Variáveis para contagem
TOTAL_TESTS=0
PASSED_TESTS=0

# Test 1: Health check
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/" "GET" "false" "" "Health Check"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 2: Authentication
TOTAL_TESTS=$((TOTAL_TESTS+1))
AUTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=claytonborgesdev@gmail.com&password=123Senha@" "${API_URL}/api/v1/auth/login")
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ ! -z "$TOKEN" ]; then
    log_info "✅ Authentication - OK"
    echo "- ✅ **Authentication** - OK" >> $REPORT_FILE
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    log_error "❌ Authentication - Failed"
    echo "- ❌ **Authentication** - Failed" >> $REPORT_FILE
    echo "  - Response: \`$AUTH_RESPONSE\`" >> $REPORT_FILE
fi

# Test 3: Get Players (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/players/players/" "GET" "true" "" "Get Players"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 4: Get Characters (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/players/1/characters" "GET" "true" "" "Get Characters"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 5: Get Plantings (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/plantings/plantings/" "GET" "true" "" "Get Plantings"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 6: Get Quadrants (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/quadrants/quadrants/" "GET" "true" "" "Get Quadrants"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 7: Get Inputs (authenticated) - Testing the new insumos/resources functionality
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/tools/tools/" "GET" "true" "" "Get Inputs/Resources"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 8: Get Current Season (authenticated) - Testing the seasonality system
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/species/species/" "GET" "true" "" "Get Current Season"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 9: Get Heads for Character Customization
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/character/character/heads" "GET" "true" "" "Get Character Heads"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 10: Get Bodies for Character Customization
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/v1/character/character/bodies" "GET" "true" "" "Get Character Bodies"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Calcular a taxa de sucesso
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

# Adicionar resumo ao relatório
echo "" >> $REPORT_FILE
echo "## Summary" >> $REPORT_FILE
echo "- **Total Tests:** $TOTAL_TESTS" >> $REPORT_FILE
echo "- **Passed Tests:** $PASSED_TESTS" >> $REPORT_FILE
echo "- **Success Rate:** $SUCCESS_RATE%" >> $REPORT_FILE

# Exibir resultados
log_info "Smoke tests passed with $SUCCESS_RATE% success rate"
log_info "Smoke test report saved to: $REPORT_FILE"

# Tornar o script executável
chmod +x "$0"
