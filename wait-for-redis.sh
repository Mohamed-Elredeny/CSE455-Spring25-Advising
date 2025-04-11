#!/bin/bash

# Wait for Redis to be ready
until redis-cli -h "$1" ping; do
  echo "Waiting for Redis to be ready..."
  sleep 1
done

echo "Redis is ready!" 