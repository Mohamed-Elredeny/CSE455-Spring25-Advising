FROM python:3.9

# Install PostgreSQL client and other dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make wait-for-postgres.sh executable
RUN chmod +x wait-for-postgres.sh

# Set Python path to include the app directory
ENV PYTHONPATH=/app

# Command will be provided by docker-compose.yml
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 