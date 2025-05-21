#!/bin/bash
set -e

# Log the start of the entrypoint script
echo "Starting entrypoint script at $(date)"

# Extract PostgreSQL connection info from DATABASE_URL
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):(.*)/(.+) ]]; then
    POSTGRES_USER=${BASH_REMATCH[1]}
    POSTGRES_PASSWORD=${BASH_REMATCH[2]}
    POSTGRES_HOST=${BASH_REMATCH[3]}
    POSTGRES_DB=${BASH_REMATCH[5]}
else
    echo "Could not parse DATABASE_URL, using environment variables directly"
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

# Use default values for PostgreSQL connection if not parsed from DATABASE_URL
POSTGRES_HOST=${POSTGRES_HOST:-db}
POSTGRES_USER=${POSTGRES_USER:-novorio}
POSTGRES_DB=${POSTGRES_DB:-novorio_production}

# Try pg_isready with increasing timeout
MAX_RETRIES=30
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    if pg_isready -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for DB... (attempt $((COUNT+1))/$MAX_RETRIES)"
    COUNT=$((COUNT+1))
    sleep 2
    
    if [ $COUNT -eq $MAX_RETRIES ]; then
        echo "WARNING: PostgreSQL not ready after $MAX_RETRIES attempts, but proceeding anyway"
    fi
done

# Ensure DATABASE_URL is properly formatted for async operations
# If it starts with postgresql://, replace with postgresql+asyncpg://
if [[ $DATABASE_URL == postgresql://* ]]; then
    export DATABASE_URL=${DATABASE_URL/postgresql:\/\//postgresql+asyncpg:\/\/}
    echo "Converted DATABASE_URL to use asyncpg driver"
fi

# For synchronous operations (like alembic), use a separate connection string
SYNC_DB_URL=${DATABASE_URL/postgresql+asyncpg:\/\//postgresql:\/\/}

# Run Alembic migrations
echo "Running database migrations using Alembic..."
DATABASE_URL=$SYNC_DB_URL alembic upgrade head

# Initialize scheduler manually
echo "Starting scheduler after successful migrations..."
python -c "from src.services.scheduler import start_scheduler; from src.db import SessionLocal; start_scheduler(SessionLocal)"

# Start Uvicorn server
echo "Starting Uvicorn server on port ${PORT}..."
exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT}
