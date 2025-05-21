#!/bin/bash

# Script for deploying the Novo Rio application to the staging environment
# This script handles the build and deployment of Docker containers directly

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
REPORT_FILE="${PROJECT_ROOT}/deployment_report.md"

# Network and container names
NETWORK_NAME="novo-rio-staging-network"
BACKEND_CONTAINER="novo-rio-backend-staging"
DB_CONTAINER="novo-rio-db-staging"
REDIS_CONTAINER="novo-rio-redis-staging"

# Image names and tags
BACKEND_IMAGE="novo-rio/backend:staging"
DB_VERSION="postgres:13"
REDIS_VERSION="redis:6-alpine"

# Validate environment
if [ ! -f "${STAGING_ENV_FILE}" ]; then
    log_error "Staging environment file not found at ${STAGING_ENV_FILE}"
    log_info "Make sure to copy .env.staging.example to .env.staging and configure it"
    exit 1
fi

# Load environment variables from .env.staging
source "${STAGING_ENV_FILE}"

# Create deployment report
echo "# Novo Rio Staging Deployment Report" > "${REPORT_FILE}"
echo "Generated: $(date)" >> "${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"

# Step 1: Build Docker images
log_info "Step 1: Building Docker images..."
echo "## 1. Docker Build" >> "${REPORT_FILE}"

cd "${PROJECT_ROOT}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    echo "❌ Docker build failed: Docker not found" >> "${REPORT_FILE}"
    exit 1
fi

# Build the backend Docker image
log_info "Building backend Docker image..."
docker build -t ${BACKEND_IMAGE} -f backend/Dockerfile ./backend
if [ $? -ne 0 ]; then
    log_error "Backend Docker build failed"
    echo "❌ Backend Docker build failed" >> "${REPORT_FILE}"
    exit 1
else
    log_info "Backend Docker build completed successfully"
    echo "✅ Backend Docker build completed successfully" >> "${REPORT_FILE}"
fi

# Step 2: Deploy to staging environment
log_info "Step 2: Deploying to staging environment..."
echo "" >> "${REPORT_FILE}"
echo "## 2. Deployment to Staging" >> "${REPORT_FILE}"

# Create Docker network if it doesn't exist
log_info "Setting up Docker network..."
docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || docker network create ${NETWORK_NAME}
echo "✅ Docker network setup completed" >> "${REPORT_FILE}"

# Stop and remove any existing containers
log_info "Stopping existing containers..."
docker stop ${BACKEND_CONTAINER} ${DB_CONTAINER} ${REDIS_CONTAINER} 2>/dev/null || true
docker rm ${BACKEND_CONTAINER} ${DB_CONTAINER} ${REDIS_CONTAINER} 2>/dev/null || true
echo "✅ Stopped and removed existing containers" >> "${REPORT_FILE}"

# Start Redis container
log_info "Starting Redis container..."
docker run -d \
    --name ${REDIS_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    ${REDIS_VERSION}

if [ $? -ne 0 ]; then
    log_error "Failed to start Redis container"
    echo "❌ Failed to start Redis container" >> "${REPORT_FILE}"
    exit 1
else
    log_info "Redis container started successfully"
    echo "✅ Redis container started successfully" >> "${REPORT_FILE}"
fi

# Start PostgreSQL container
log_info "Starting PostgreSQL container..."
docker run -d \
    --name ${DB_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    -e POSTGRES_USER=${POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${POSTGRES_DB} \
    -v novo-rio-db-data:/var/lib/postgresql/data \
    ${DB_VERSION}

if [ $? -ne 0 ]; then
    log_error "Failed to start PostgreSQL container"
    echo "❌ Failed to start PostgreSQL container" >> "${REPORT_FILE}"
    exit 1
else
    log_info "PostgreSQL container started successfully"
    echo "✅ PostgreSQL container started successfully" >> "${REPORT_FILE}"
fi

# Wait for PostgreSQL to be ready
log_info "Waiting for PostgreSQL to be ready..."
sleep 5

# Start Backend container
log_info "Starting Backend container..."
docker run -d \
    --name ${BACKEND_CONTAINER} \
    --network ${NETWORK_NAME} \
    --restart unless-stopped \
    -p 8000:8000 \
    -e DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_CONTAINER}:5432/${POSTGRES_DB} \
    -e REDIS_URL=redis://${REDIS_CONTAINER}:6379/0 \
    -e SECRET_KEY=${SECRET_KEY} \
    -e ENVIRONMENT=${ENVIRONMENT} \
    -e CORS_ORIGINS=${CORS_ORIGINS} \
    -e TZ=America/Sao_Paulo \
    -e SCHEDULER_START_AFTER_MIGRATIONS=true \
    ${BACKEND_IMAGE}

if [ $? -ne 0 ]; then
    log_error "Failed to start Backend container"
    echo "❌ Failed to start Backend container" >> "${REPORT_FILE}"
    exit 1
else
    log_info "Backend container started successfully"
    echo "✅ Backend container started successfully" >> "${REPORT_FILE}"
fi

# Step 3: Verify deployment
log_info "Step 3: Verifying deployment..."
echo "" >> "${REPORT_FILE}"
echo "## 3. Deployment Verification" >> "${REPORT_FILE}"

# Wait for backend to be ready (simple health check)
MAX_RETRIES=30
RETRY_INTERVAL=5
BACKEND_READY=false

log_info "Waiting for backend to be ready..."
echo "Checking backend health..." >> "${REPORT_FILE}"

for i in $(seq 1 $MAX_RETRIES); do
    log_info "Checking backend health (attempt $i of $MAX_RETRIES)..."
    if curl -s http://localhost:8084/health | grep -q "ok"; then
        BACKEND_READY=true
        log_info "Backend is ready!"
        echo "✅ Backend is healthy" >> "${REPORT_FILE}"
        break
    else
        log_warning "Backend not ready yet, retrying in ${RETRY_INTERVAL} seconds..."
        sleep $RETRY_INTERVAL
    fi
done

if [ "$BACKEND_READY" = false ]; then
    log_error "Backend health check failed after $MAX_RETRIES attempts"
    echo "❌ Backend health check failed" >> "${REPORT_FILE}"
    exit 1
fi

# Final report
log_info "Deployment completed successfully!"
echo "" >> "${REPORT_FILE}"
echo "## Summary" >> "${REPORT_FILE}"
echo "✅ Deployment to staging completed successfully" >> "${REPORT_FILE}"
echo "Timestamp: $(date)" >> "${REPORT_FILE}"

# Display container status
log_info "Container status:"
docker ps --filter "name=novo-rio" >> "${REPORT_FILE}"

log_info "Deployment report saved to: ${REPORT_FILE}"
echo "" >> "${REPORT_FILE}"
echo "To run smoke tests, execute: ./backend/scripts/run_staging_smoke_tests.sh" >> "${REPORT_FILE}"

exit 0
