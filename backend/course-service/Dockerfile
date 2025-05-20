FROM python:3.9-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt

# Final stage
FROM python:3.9-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m appuser

WORKDIR /app

# Copy wheels from builder stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir /wheels/*

# Copy application code
COPY . .

# Make wait scripts executable
RUN chmod +x wait-for-postgres.sh wait-for-redis.sh

# Set Python path to include the app directory
ENV PYTHONPATH=/app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8000

# Command will be provided by docker-compose.yml or kubernetes config
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 