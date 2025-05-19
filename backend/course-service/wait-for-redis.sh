#!/bin/bash

# Get Redis hostname from env variable or use the first argument
REDIS_HOST=${REDIS_HOST:-"$1"}
REDIS_HOST=${REDIS_HOST:-"redis"}

echo "Waiting for Redis at $REDIS_HOST..."
# Wait for Redis to be ready
until redis-cli -h "$REDIS_HOST" ping; do
  echo "Waiting for Redis to be ready..."
  sleep 1
done

echo "Redis is ready!" 