#!/bin/bash

# Smoke test script for Novo Rio staging environment
# Tests critical endpoints and functionality

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAGING_ENV_FILE="${PROJECT_ROOT}/.env.staging"
REPORT_FILE="${PROJECT_ROOT}/smoke_test_report.md"

# Use environment variables if provided, otherwise use defaults
STAGING_URL=${API_BASE_URL:-"http://localhost:8084"}  # URL from environment or default
TEST_USER=${ADMIN_EMAIL:-"test@novoRio.com"}
TEST_PASS=${ADMIN_PASSWORD:-"testpassword123"}
AUTH_TOKEN=""

# Docker container names
BACKEND_CONTAINER="novo-rio-backend-staging"

# Check if jq is installed (used for JSON parsing)
if ! command -v jq &> /dev/null; then
    log_error "jq is not installed. Please install it to run these tests."
    exit 1
fi

# Create smoke test report
echo "# Novo Rio Staging Smoke Test Report" > "${REPORT_FILE}"
echo "Generated: $(date)" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"
echo "## Test Results" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"
echo "| Endpoint | Status | Response Time (ms) |" >> "${REPORT_FILE}"
echo "|----------|--------|------------------|" >> "${REPORT_FILE}"

# Function to run a test and log results
run_test() {
    local endpoint="$1"
    local method="${2:-GET}"
    local auth="${3:-false}"
    local payload="$4"
    local description="${5:-$endpoint}"
    local auth_header=""
    
    log_info "Testing endpoint: ${endpoint} (${method})"
    
    if [ "$auth" = "true" ] && [ ! -z "$AUTH_TOKEN" ]; then
        auth_header="-H 'Authorization: Bearer ${AUTH_TOKEN}'"
    fi
    
    local payload_arg=""
    if [ ! -z "$payload" ]; then
        payload_arg="-d '${payload}'"
    fi
    
    # Combine all arguments
    local curl_cmd="curl -s -X ${method} ${auth_header} ${payload_arg} -H 'Content-Type: application/json' -w '%{time_total}\n' ${STAGING_URL}${endpoint}"
    
    # Run the curl command and get both response and time
    local start_time=$(date +%s%N)
    local response=$(eval ${curl_cmd})
    local status=$?
    local end_time=$(date +%s%N)
    
    # Extract the response time (last line)
    local time_total=$(echo "$response" | tail -n 1)
    local response_body=$(echo "$response" | sed '$d')
    
    # Calculate time in milliseconds
    local time_ms=$(echo "$time_total * 1000" | bc | cut -d'.' -f1)
    
    # Check if the response is valid JSON
    if echo "$response_body" | jq . >/dev/null 2>&1; then
        # Try to extract status or success field if available
        local api_status=$(echo "$response_body" | jq -r '.status // .success // "unknown"' 2>/dev/null)
        
        if [ "$status" -eq 0 ] && [ "$api_status" != "error" ] && [ "$api_status" != "false" ]; then
            log_info "✅ ${description} - OK (${time_ms}ms)"
            echo "| ${description} | ✅ Success | ${time_ms} |" >> "${REPORT_FILE}"
            return 0
        else
            log_error "❌ ${description} - Failed"
            echo "| ${description} | ❌ Failed | ${time_ms} |" >> "${REPORT_FILE}"
            return 1
        fi
    else
        # For non-JSON responses, check HTTP status code if possible
        if [ "$status" -eq 0 ] && [[ "$response_body" == *"ok"* || "$response_body" == *"OK"* ]]; then
            log_info "✅ ${description} - OK (${time_ms}ms)"
            echo "| ${description} | ✅ Success | ${time_ms} |" >> "${REPORT_FILE}"
            return 0
        else
            log_error "❌ ${description} - Failed"
            echo "| ${description} | ❌ Failed | ${time_ms} |" >> "${REPORT_FILE}"
            return 1
        fi
    fi
}

# Start tests
log_info "Starting smoke tests on ${STAGING_URL}"
echo "Staging URL: ${STAGING_URL}" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

# Track overall test status
PASSED_TESTS=0
TOTAL_TESTS=0

# Test 1: Health check
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/health" "GET" "false" "" "Health Check"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 2: Authenticate
TOTAL_TESTS=$((TOTAL_TESTS+1))
AUTH_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"${TEST_USER}\",\"password\":\"${TEST_PASS}\"}" ${STAGING_URL}/auth/login)
if echo "$AUTH_RESULT" | jq -e '.token' > /dev/null 2>&1; then
    AUTH_TOKEN=$(echo "$AUTH_RESULT" | jq -r '.token')
    log_info "✅ Authentication - OK"
    echo "| Authentication | ✅ Success | - |" >> "${REPORT_FILE}"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    log_error "❌ Authentication - Failed"
    echo "| Authentication | ❌ Failed | - |" >> "${REPORT_FILE}"
fi

# Test 3: Get Players (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/players" "GET" "true" "" "Get Players"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 4: Get Characters (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/characters" "GET" "true" "" "Get Characters"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 5: Get Plantings (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/plantings" "GET" "true" "" "Get Plantings"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 6: Get Quadrants (authenticated)
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/quadrants" "GET" "true" "" "Get Quadrants"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 7: Get Inputs (authenticated) - Testing the new insumos/resources functionality
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/inputs" "GET" "true" "" "Get Inputs/Resources"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 8: Get Current Season (authenticated) - Testing the seasonality system
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/seasons/current" "GET" "true" "" "Get Current Season"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 9: Get Heads for Character Customization
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/heads" "GET" "true" "" "Get Character Heads"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Test 10: Get Bodies for Character Customization
TOTAL_TESTS=$((TOTAL_TESTS+1))
if run_test "/api/bodies" "GET" "true" "" "Get Character Bodies"; then
    PASSED_TESTS=$((PASSED_TESTS+1))
fi

# Generate summary
PASS_PERCENTAGE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))

echo "" >> "${REPORT_FILE}"
echo "## Summary" >> "${REPORT_FILE}"
echo "- Tests Executed: ${TOTAL_TESTS}" >> "${REPORT_FILE}"
echo "- Tests Passed: ${PASSED_TESTS}" >> "${REPORT_FILE}"
echo "- Tests Failed: $((TOTAL_TESTS - PASSED_TESTS))" >> "${REPORT_FILE}"
echo "- Success Rate: ${PASS_PERCENTAGE}%" >> "${REPORT_FILE}"

if [ "$PASS_PERCENTAGE" -ge 80 ]; then
    echo "" >> "${REPORT_FILE}"
    echo "✅ **OVERALL STATUS: PASS**" >> "${REPORT_FILE}"
    echo "The smoke tests were successful with ${PASS_PERCENTAGE}% of tests passing." >> "${REPORT_FILE}"
    log_info "Smoke tests passed with ${PASS_PERCENTAGE}% success rate"
else
    echo "" >> "${REPORT_FILE}"
    echo "❌ **OVERALL STATUS: FAIL**" >> "${REPORT_FILE}"
    echo "The smoke tests failed with only ${PASS_PERCENTAGE}% of tests passing." >> "${REPORT_FILE}"
    echo "Please review the failed tests before proceeding." >> "${REPORT_FILE}"
    log_error "Smoke tests failed with only ${PASS_PERCENTAGE}% success rate"
fi

echo "" >> "${REPORT_FILE}"
echo "Smoke test report completed at $(date)" >> "${REPORT_FILE}"

log_info "Smoke test report saved to: ${REPORT_FILE}"

exit 0
