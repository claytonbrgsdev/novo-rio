# Build stage
FROM python:3.9-slim as builder

# Set environment variables
ENV PYTHONDONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.4.2

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Set work directory
WORKDIR /app

# Copy only requirements to cache them in docker layer
COPY poetry.lock pyproject.toml ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-dev

# Runtime stage
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app" \
    PATH="/app/.local/bin:$PATH" \
    PORT=8000 \
    GUNICORN_WORKERS=4 \
    GUNICORN_THREADS=2 \
    GUNICORN_TIMEOUT=120 \
    GUNICORN_LOG_LEVEL=info \
    DATABASE_URL="sqlite:////data/db.sqlite3"

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system app && adduser --system --group app

# Set work directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Copy Alembic configuration and migrations
COPY --chown=app:app alembic.ini .
COPY --chown=app:app alembic ./alembic

# Create data directory and set permissions
RUN mkdir -p /data && chown -R app:app /data /app

# Switch to non-root user
USER app

# Expose the port the app runs on
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Command to run migrations and start the server
CMD ["bash", "-c", "alembic upgrade head && \
      gunicorn \
        --bind 0.0.0.0:${PORT} \
        --workers ${GUNICORN_WORKERS} \
        --threads ${GUNICORN_THREADS} \
        --timeout ${GUNICORN_TIMEOUT} \
        --worker-class uvicorn.workers.UvicornWorker \
        --log-level ${GUNICORN_LOG_LEVEL} \
        --access-logfile - \
        --error-logfile - \
        --chdir /app \
        src.main:app"]
